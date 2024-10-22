import { Where } from "payload/types";
import { z } from "zod";
import type { Media, Partner } from "~/payload/payload-types";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { ZGetListParams } from "~/server/types";

export interface PartnerIncluded extends Partner {
  icon: Media;
}

export const partnerRouter = createTRPCRouter({
  getList: publicProcedure
    .input(
      ZGetListParams.merge(
        z.object({
          names: z.array(z.string()).optional(),
          stared: z.boolean().optional(),
        })
      )
    )
    .query(async ({ ctx, input }) => {
      const { perPage, page, sort, names, stared } = input;

      let where = {} as Where;

      if (stared) {
        where.stared = { equals: true };
      }

      if (names && names.length > 0) {
        where = {
          name: {
            in: names,
          },
        };
      }

      console.log(where);

      const partners = await ctx.payload.find({
        collection: "partners",
        limit: perPage,
        page: page,
        sort,
        where,
      });

      console.log(partners.docs);

      return {
        data: partners.docs as PartnerIncluded[],
        metadata: { page, count: partners.docs.length },
      };
    }),
});
