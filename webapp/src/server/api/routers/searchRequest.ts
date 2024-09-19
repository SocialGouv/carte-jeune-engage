import { z } from "zod";
import { createTRPCRouter, userProtectedProcedure } from "~/server/api/trpc";

export const searchRequestRouter = createTRPCRouter({
  upsert: userProtectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input: searchString }) => {
      const formatedSearchString = searchString.trim().toLowerCase();

      const existingSearchRequests = await ctx.payload.find({
        collection: "search_requests",
        page: 1,
        limit: 1,
        where: {
          name: { equals: formatedSearchString },
        },
      });

      const existingSearchRequest = existingSearchRequests.docs[0];

      if (!existingSearchRequest) {
        const test = await ctx.payload.create({
          collection: "search_requests",
          data: { name: formatedSearchString, count: 1 },
        });

        return test;
      } else {
        const updateSearchRequest = await ctx.payload.update({
          id: existingSearchRequest.id,
          collection: "search_requests",
          data: {
            count: existingSearchRequest.count + 1,
          },
        });

        return updateSearchRequest;
      }
    }),
});
