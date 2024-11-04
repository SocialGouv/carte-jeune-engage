import { z } from "zod";
import { createTRPCRouter, userProtectedProcedure } from "~/server/api/trpc";
import { createOrderPayload } from "~/utils/obiz";

export const orderRouter = createTRPCRouter({
  createOrder: userProtectedProcedure
    .input(z.object({ user_id: z.number(), client_id: z.number() }))
    .query(async ({ ctx, input }) => {
      const order_payload = createOrderPayload(input);

      const [] = await ctx.soapObizClient.CREATION_COMMANDE_ARRAYAsync();

      return { data: "Hello" };
    }),
});
