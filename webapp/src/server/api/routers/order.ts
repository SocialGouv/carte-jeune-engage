import { createTRPCRouter, userProtectedProcedure } from "~/server/api/trpc";

export const orderRouter = createTRPCRouter({
  createOrder: userProtectedProcedure.query(async ({ ctx }) => {
    // const [test] = await ctx.soapObizClient.ETAT_SITEAsync();

    // console.log(JSON.stringify(test, null, 2));

    return { data: "Hello" };
  }),
});
