import { TRPCError } from "@trpc/server";
import { z } from "zod";
import type { Tag, Media } from "~/payload/payload-types";
import { createTRPCRouter, userProtectedProcedure } from "~/server/api/trpc";

export interface TagIncluded extends Tag {
  icon: Media;
}

export const tagRouter = createTRPCRouter({
  getBySlug: userProtectedProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const { slug } = input;

      const tags = await ctx.payload.find({
        collection: "tags",
        where: {
          slug: {
            equals: slug,
          },
        },
      });

      if (!tags.docs.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tag not found",
        });
      }

      return { data: tags.docs[0] as TagIncluded };
    }),
});
