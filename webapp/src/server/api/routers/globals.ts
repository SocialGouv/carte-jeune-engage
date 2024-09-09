import {
  createTRPCRouter,
  publicProcedure,
  userProtectedProcedure,
} from "~/server/api/trpc";
import { PartnerIncluded } from "./partner";
import { OfferIncluded } from "./offer";
import { Media } from "~/payload/payload-types";
import { CategoryIncluded } from "./category";

export const globalsRouter = createTRPCRouter({
  quickAccessGetAll: userProtectedProcedure.query(async ({ ctx }) => {
    const quickAccess = await ctx.payload.findGlobal({
      slug: "quickAccess",
      depth: 3,
    });

    const partners = quickAccess.items as {
      partner: PartnerIncluded;
      offer: OfferIncluded;
      id?: string;
    }[];

    return {
      data: partners,
    };
  }),

  landingPartnersGetLogos: publicProcedure.query(async ({ ctx }) => {
    const landingPartners = await ctx.payload.findGlobal({
      slug: "landingPartners",
      depth: 3,
    });

    const partners = landingPartners.items?.map(
      (item) => item.partner
    ) as PartnerIncluded[];

    const logoPartners = partners.map((partner) => partner.icon);

    return {
      data: logoPartners,
    };
  }),

  landingFAQGetAll: publicProcedure.query(async ({ ctx }) => {
    const landingFAQ = await ctx.payload.findGlobal({
      slug: "landingFAQ",
      depth: 3,
    });

    return {
      data: landingFAQ.items,
    };
  }),

  getNewCategory: userProtectedProcedure.query(async ({ ctx }) => {
    const newCategory = await ctx.payload.findGlobal({
      slug: "newCategory",
      depth: 1,
    });

    const tmpNewCategory = newCategory as CategoryIncluded & {
      items: { offer: OfferIncluded }[];
    };

    tmpNewCategory.slug = "new";

    return {
      data: tmpNewCategory,
    };
  }),

  categoriesListOrdered: publicProcedure.query(async ({ ctx }) => {
    const categoriesList = await ctx.payload.findGlobal({
      slug: "categories_list",
      depth: 2,
    });

    const categories = categoriesList.items?.map(
      (item) => item.category
    ) as CategoryIncluded[];

    return {
      data: categories,
    };
  }),
});
