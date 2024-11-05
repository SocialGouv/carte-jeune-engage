import { z } from "zod";
import { createTRPCRouter, userProtectedProcedure } from "~/server/api/trpc";
import { createOrderPayload, obiz_signature } from "~/utils/obiz";

export const orderRouter = createTRPCRouter({
  createOrder: userProtectedProcedure
    // .input(z.object({ user_id: z.number(), client_id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // const { user_id, client_id } = input;

      const order_payload = createOrderPayload();

      try {
        const [result] = await ctx.soapObizClient.CREATION_COMMANDE_ARRAYAsync({
          CE_ID: process.env.OBIZ_PARTNER_ID,
          ...order_payload,
        });
        console.log(JSON.stringify(result, null, 2));
      } catch (error) {
        console.error(error);
      }

      return { data: "Hello" };
    }),
});
