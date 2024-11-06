import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, userProtectedProcedure } from "~/server/api/trpc";
import { createOrderPayload, insertItemPayload } from "~/utils/obiz";

export const orderRouter = createTRPCRouter({
  createOrder: userProtectedProcedure
    .input(
      z.object({
        offer_id: z.number(),
        article_reference: z.string(),
        input_value: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { offer_id, article_reference, input_value } = input;

      const user = await ctx.payload.findByID({
        collection: "users",
        id: ctx.session.id,
      });

      const offer = await ctx.payload.findByID({
        collection: "offers",
        id: offer_id,
      });

      const article = (offer.articles || [])
        .filter((a) => !!a.available)
        .find((a) => a.reference === article_reference);

      if (!article) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Article with reference "${article_reference}" not found in offer ${offer.id}`,
        });
      }

      try {
        // CREATION DE LA COMMANDE
        const create_order_payload = createOrderPayload(user, "CARTECADEAU");
        const [resultOrder] =
          await ctx.soapObizClient.CREATION_COMMANDE_ARRAYAsync({
            CE_ID: process.env.OBIZ_PARTNER_ID,
            ...create_order_payload,
          });
        const resultOrderObject =
          resultOrder.CREATION_COMMANDE_ARRAYResult.diffgram.NewDataSet
            .Commande;
        const orderNumber = resultOrderObject.commandes_numero;

        // INSERTION DE L'ARTICLE
        const insert_item_payload = insertItemPayload(
          orderNumber,
          user,
          article,
          "CARTECADEAU",
          input_value
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
          const order = await ctx.payload.create({
            collection: "orders",
            data: {
              number: orderNumber,
              user: user.id,
              status: "awaiting_payment",
              payment_url: resultItemObject?.url_paiement,
              articles: [
                {
                  article_reference: article.reference,
                  article_quantity: 1,
                  article_montant: input_value || article.price || 0,
                },
              ],
            },
          });

          return {
            data: order,
          };
        } else {
          // Erreur dans la réponse SOAP
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

  synchronizeOrder: userProtectedProcedure
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

      if (order.user !== ctx.session.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: `Your are not able to synchronize this order`,
        });
      }

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
          case "NON FINALISEE":
          case "EN ATTENTE":
            newStatus = "awaiting_payment";
            break;

          case "PREPARATION":
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
          case "RESTOCKING":
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

          console.log(order.number);
          console.log(JSON.stringify(resultGetTicketsObject, null, 2));

          // GET AND SAVE PDF(s)
        }

        if (newStatus !== order.status) {
          order = await ctx.payload.update({
            id: order_id,
            collection: "orders",
            data: {
              status: newStatus,
              obiz_status: resultOrderStatusObject.etats_statut,
            },
          });
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
});
