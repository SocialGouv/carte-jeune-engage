import { Where } from "payload";
import { z } from "zod";
import type { Media, Partner } from "~/payload/payload-types";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { ZGetListParams } from "~/server/types";

export interface PartnerIncluded extends Partner {
  icon: Media;
}

export const partnerRouter = createTRPCRouter({
  getList: publicProcedure
    .input(ZGetListParams.merge(z.object({ stared: z.boolean().optional() })))
    .query(async ({ ctx, input }) => {
      const { perPage, page, sort, stared } = input;

      let where = {} as Where;

      if (stared) {
        where.stared = { equals: true };
      }

      const partners = await ctx.payload.find({
        collection: "partners",
        limit: perPage,
        page: page,
        sort,
        where,
      });

      return {
        data: partners.docs as PartnerIncluded[],
        metadata: { page, count: partners.docs.length },
      };
    }),
});
