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
});
