import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, userProtectedProcedure } from "~/server/api/trpc";
import { createOrderPayload } from "~/utils/obiz";

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

      const order_payload = createOrderPayload(user, "CARTECADEAU");

      try {
        const [result] = await ctx.soapObizClient.CREATION_COMMANDE_ARRAYAsync({
          CE_ID: process.env.OBIZ_PARTNER_ID,
          ...order_payload,
        });

        const commandeNumero =
          result.CREATION_COMMANDE_ARRAYResult.diffgram.NewDataSet.Commande
            .commandes_numero;
        console.log("Commande number:", commandeNumero);
      } catch (error) {
        console.error(error);
      }

      return { data: "Hello" };
    }),
});
