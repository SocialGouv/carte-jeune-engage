import { TRPCError } from "@trpc/server";
import { z } from "zod";
import type { Category, Media } from "~/payload/payload-types";
import {
  createTRPCRouter,
  userProtectedProcedure,
  publicProcedure,
  userOrWidgetProtectedProcedure,
} from "~/server/api/trpc";
import { ZGetListParams } from "~/server/types";

export interface CategoryIncluded extends Category {
  icon: Media;
}

export const categoryRouter = createTRPCRouter({
  getList: publicProcedure
    .input(ZGetListParams)
    .query(async ({ ctx, input }) => {
      const { perPage, page, sort } = input;

      const categories = await ctx.payload.find({
        collection: "categories",
        limit: perPage,
        page: page,
        sort,
      });

      return {
        data: categories.docs as CategoryIncluded[],
        metadata: { page, count: categories.docs.length },
      };
    }),

  getBySlug: userOrWidgetProtectedProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const { slug } = input;

      const category = await ctx.payload.find({
        collection: "categories",
        where: {
          slug: {
            equals: slug,
          },
        },
      });

      if (!category.docs.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Category not found",
        });
      }

      return { data: category.docs[0] as CategoryIncluded };
    }),
});
