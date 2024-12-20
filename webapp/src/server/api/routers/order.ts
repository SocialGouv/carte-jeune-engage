import { TRPCError } from "@trpc/server";
import path from "path";
import { z } from "zod";
import { Media, Offer, Order, Partner, User } from "~/payload/payload-types";
import {
  createTRPCRouter,
  publicProcedure,
  userProtectedProcedure,
} from "~/server/api/trpc";
import { createOrderPayload, insertItemPayload } from "~/utils/obiz";
import fs from "fs/promises";
import os from "os";
import { Where } from "payload/types";
import { PDFDocument } from "pdf-lib";
import {
  getHtmlRecapOrderPaid,
  getHtmlRecapOrderDelivered,
  getHtmlSignalOrder,
} from "~/utils/emailHtml";
import { OfferIncluded } from "./offer";

export interface OrderIncluded extends Order {
  offer: Offer & { partner: Partner & { icon: Media } } & { image: Media };
  user: User;
}

const createPdfMedia = async (
  pdfData: string | string[],
  orderNumber: number,
  ctx: any
) => {
  try {
    const pdfs = Array.isArray(pdfData) ? pdfData : [pdfData];
    const tempFileName = `ticket-${orderNumber}-${Date.now()}.pdf`;
    const tempFilePath = path.join(os.tmpdir(), tempFileName);

    // If single PDF, process as before
    if (pdfs.length === 1) {
      const pdfBuffer = Buffer.from(pdfs[0], "base64");
      await fs.writeFile(tempFilePath, pdfBuffer);
    }
    // If multiple PDFs, merge them
    else {
      const mergedPdf = await PDFDocument.create();

      for (const pdf of pdfs) {
        const pdfBuffer = Buffer.from(pdf, "base64");
        const pdfDoc = await PDFDocument.load(pdfBuffer);
        const pages = await mergedPdf.copyPages(
          pdfDoc,
          pdfDoc.getPageIndices()
        );
        pages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedPdfBytes = await mergedPdf.save();
      await fs.writeFile(tempFilePath, mergedPdfBytes);
    }

    const pdfMedia = await ctx.payload.create({
      collection: "media",
      filePath: tempFilePath,
      data: {
        alt: `Ticket for order ${orderNumber}`,
      },
    });

    await fs.unlink(tempFilePath);
    return pdfMedia;
  } catch (error) {
    console.error("Error processing PDF:", error);
    throw error;
  }
};

export const orderRouter = createTRPCRouter({
  createOrder: userProtectedProcedure
    .input(
      z.object({
        offer_id: z.number(),
        article_references: z.array(
          z.object({
            reference: z.string(),
            quantity: z.number().default(1),
          })
        ),
        input_value: z.number().optional(),
        input_value_public: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { offer_id, article_references, input_value, input_value_public } =
        input;

      const user = await ctx.payload.findByID({
        collection: "users",
        id: ctx.session.id,
      });

      const offer = await ctx.payload.findByID({
        collection: "offers",
        id: offer_id,
      });

      const articles = (offer.articles || [])
        .filter(
          (a) =>
            !!a.available &&
            article_references.find((ar) => ar.reference === a.reference)
        )
        .map((a) => ({
          ...a,
          quantity:
            article_references.find((ar) => ar.reference === a.reference)
              ?.quantity || 1,
        }));

      if (articles.length !== article_references.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Articles with references "${article_references.map((ar) => ar.reference).join(", ")}" not found in offer ${offer.id}`,
        });
      }

      const initialOrder = await ctx.payload.create({
        collection: "orders",
        data: {
          number: 0,
          user: user.id,
          offer: offer.id,
          status: "init",
        },
      });

      try {
        const total_amount_to_pay = articles.reduce((acc, currentArticle) => {
          const articleReference = article_references.find(
            (ar) => ar.reference === currentArticle.reference
          );

          if (articleReference) {
            if (currentArticle.kind === "fixed_price" && currentArticle.price) {
              return acc + currentArticle.price * articleReference.quantity;
            } else if (
              currentArticle.kind === "variable_price" &&
              input_value
            ) {
              return acc + input_value * articleReference.quantity;
            }
          }
          return acc;
        }, 0);

        // CREATION DE LA COMMANDE
        const create_order_payload = createOrderPayload(
          user,
          initialOrder,
          "CARTECADEAU",
          total_amount_to_pay
        );
        const [resultOrder] =
          await ctx.soapObizClient.CREATION_COMMANDE_ARRAYAsync({
            CE_ID: process.env.OBIZ_PARTNER_ID,
            ...create_order_payload,
          });
        const resultOrderObject =
          resultOrder.CREATION_COMMANDE_ARRAYResult.diffgram.NewDataSet
            .Commande;
        const orderNumber = resultOrderObject.commandes_numero;

        if (!orderNumber || orderNumber === "0") {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to create order: ${resultOrderObject.message_erreur || "Unknown error"}`,
          });
        }

        // INSERTION DE L'ARTICLE
        const insert_item_payload = insertItemPayload(
          orderNumber,
          user,
          articles,
          "CARTECADEAU",
          { amount: input_value_public, amount_discounted: input_value }
        );
        const [resultItem] =
          await ctx.soapObizClient.INSERTION_LIGNE_COMMANDE_ARRAY_V4Async({
            CE_ID: process.env.OBIZ_PARTNER_ID,
            commandes_numero: orderNumber,
            ...insert_item_payload,
          });

        const resultItemObject =
          resultItem.INSERTION_LIGNE_COMMANDE_ARRAY_V4Result.diffgram.NewDataSet
            .Commande;
        const isOrderCompleted =
          resultItemObject?.statut === "true" &&
          Boolean(resultItemObject?.url_paiement);

        if (isOrderCompleted) {
          const order = await ctx.payload.update({
            collection: "orders",
            id: initialOrder.id,
            data: {
              number: orderNumber,
              user: user.id,
              offer: offer.id,
              status: "awaiting_payment",
              payment_url: resultItemObject?.url_paiement,
              articles: articles.map((article) => ({
                article_reference: article.reference,
                article_quantity: article.quantity,
                article_montant: input_value_public || article.publicPrice || 0,
                article_montant_discounted: input_value || article.price || 0,
              })),
            },
          });

          return {
            data: order,
          };
        } else {
          // Erreur dans la réponse SOAP
          console.error(
            "Error from obiz SOAP web service:",
            JSON.stringify(resultItemObject)
          );
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "An error occurred from obiz SOAP web service",
          });
        }
      } catch (error) {
        console.error(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An error occurred while creating the order",
        });
      }
    }),

  synchronizeOrder: publicProcedure
    .input(
      z.object({
        order_id: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { order_id } = input;

      let order = await ctx.payload.findByID({
        collection: "orders",
        id: order_id,
        depth: 0,
      });

      // if (order.user !== ctx.session.id) {
      // 	throw new TRPCError({
      // 		code: "FORBIDDEN",
      // 		message: `Your are not able to synchronize this order`,
      // 	});
      // }

      try {
        const [resultOrderStatus] =
          await ctx.soapObizClient.ETATS_COMMANDES_ARRAYAsync({
            CE_ID: process.env.OBIZ_PARTNER_ID,
            TABLE_COMMANDES: {
              string: [order.number],
            },
          });
        const resultOrderStatusObject =
          resultOrderStatus.ETATS_COMMANDES_ARRAYResult.diffgram.NewDataSet
            .Commande;

        let newStatus = order.status;
        switch (resultOrderStatusObject.etats_statut) {
          case "EN ATTENTE":
            newStatus = "awaiting_payment";
            break;

          case "NON FINALISEE":
          case "PREPARATION":
          case "RESTOCKING":
            newStatus = "payment_completed";
            break;

          case "ENVOYEE":
          case "CONFIRMEE":
            newStatus = "delivered";
            break;

          case "ANNULEE":
          case "BLOQUEE":
          case "ERREUR":
          case "TEST":
            newStatus = "archived";
            break;
        }

        if (newStatus === "delivered") {
          const [resultGetTickets] = await ctx.soapObizClient.GET_BILLETSAsync({
            CE_ID: process.env.OBIZ_PARTNER_ID,
            commandes_numero: order.number,
          });
          const resultGetTicketsObject =
            resultGetTickets.GET_BILLETSResult.diffgram.NewDataSet.Billets;

          if (resultGetTicketsObject) {
            try {
              const data = Array.isArray(resultGetTicketsObject)
                ? resultGetTicketsObject.map((rgto) => rgto.data)
                : resultGetTicketsObject.data;
              const pdfMedia = await createPdfMedia(data, order.number, ctx);

              await ctx.payload.update({
                collection: "orders",
                id: order.id,
                data: {
                  ticket: pdfMedia.id,
                },
              });
            } catch (error) {
              console.error("Error saving PDF:", error);
              throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: `Can't save PDF.`,
              });
            }
          } else {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: `Order is delivered but no PDF found. Can't synchronize.`,
            });
          }
        }

        if (
          newStatus !== order.status ||
          resultOrderStatusObject.etats_statut !== order.obiz_status
        ) {
          const oldStatus = order.status;
          order = await ctx.payload.update({
            id: order_id,
            collection: "orders",
            data: {
              status: newStatus,
              obiz_status: resultOrderStatusObject.etats_statut,
            },
            depth: 0,
          });

          if (
            newStatus !== oldStatus &&
            ["payment_completed", "delivered"].includes(newStatus)
          ) {
            const currentUser = await ctx.payload.findByID({
              collection: "users",
              id: order.user as number,
              depth: 0,
            });

            const offer = (await ctx.payload.findByID({
              collection: "offers",
              id: order.offer as number,
              depth: 2,
            })) as OfferIncluded;

            if (newStatus === "payment_completed") {
              ctx.payload.sendEmail({
                from: process.env.SMTP_FROM_ADDRESS,
                to: currentUser.userEmail,
                subject: "Récapitulatif de votre commande",
                html: getHtmlRecapOrderPaid(currentUser, order, offer),
              });
            } else if (newStatus === "delivered") {
              ctx.payload.sendEmail({
                from: process.env.SMTP_FROM_ADDRESS,
                to: currentUser.userEmail,
                subject: "Votre commande est arrivée",
                html: getHtmlRecapOrderDelivered(currentUser, order, offer),
              });
            }
          }
        }

        return { data: order };
      } catch (error) {
        console.error(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An error occurred while synchronizing the order",
        });
      }
    }),

  getList: userProtectedProcedure
    .input(
      z.object({
        status: z.enum(["delivered"]).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { status } = input;

      let statusQuery: Where = {
        status: { not_in: ["init", "awaiting_payment", "archived"] },
      };

      if (status) {
        statusQuery = {
          status: { equals: status },
        };
      }

      const orders = await ctx.payload.find({
        collection: "orders",
        depth: 3,
        where: {
          and: [{ user: { equals: ctx.session.id } }, { ...statusQuery }],
        },
      });

      return { data: orders.docs as OrderIncluded[] };
    }),

  getIdByNumber: publicProcedure
    .input(
      z.object({
        number: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { number } = input;

      const orders = await ctx.payload.find({
        collection: "orders",
        where: {
          number: { equals: number },
        },
        depth: 3,
      });

      const order = orders.docs[0];

      if (!order) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order not found.",
        });
      }

      return {
        data: order.id,
      };
    }),

  getById: userProtectedProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { id } = input;

      const order = (await ctx.payload.findByID({
        collection: "orders",
        id,
        depth: 3,
      })) as OrderIncluded;

      if (order.user.id !== ctx.session.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not allowed to get this order.",
        });
      }

      return { data: order };
    }),

  createSignal: userProtectedProcedure
    .input(
      z.object({
        id: z.number(),
        cause: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, cause } = input;

      const existingOrderSignals = await ctx.payload.find({
        collection: "ordersignals",
        where: {
          order: { equals: id },
        },
      });
      const existingOrderSignal = existingOrderSignals.docs[0];

      if (!!existingOrderSignal) {
        return {
          data: existingOrderSignal,
        };
      }

      const orderSignal = await ctx.payload.create({
        collection: "ordersignals",
        data: {
          order: id,
          cause,
        },
        depth: 1,
      });

      const users = await ctx.payload.find({
        collection: "users",
        limit: 1,
        page: 1,
        where: {
          id: { equals: ctx.session.id },
        },
      });
      const currentUser = users.docs[0];

      ctx.payload.sendEmail({
        from: process.env.SMTP_FROM_ADDRESS,
        to: currentUser.userEmail,
        subject: "Signalement d'une commande défaillante",
        html: getHtmlSignalOrder(currentUser, {
          order: orderSignal.order as Order,
        }),
      });

      return {
        data: orderSignal,
      };
    }),
});
