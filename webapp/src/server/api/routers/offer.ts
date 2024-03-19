import { Where, WhereField } from "payload/types";
import { z } from "zod";
import { Category, Offer, Media, Partner } from "~/payload/payload-types";
import { createTRPCRouter, userProtectedProcedure } from "~/server/api/trpc";
import { ZGetListParams } from "~/server/types";
import { payloadWhereOfferIsValid } from "~/utils/tools";

export interface OfferIncluded extends Offer {
  partner: Partner & { icon: Media };
  category: Category & { icon: Media };
  imageOfEligibleStores: Media;
}

export const offerRouter = createTRPCRouter({
  getListOfAvailables: userProtectedProcedure
    .input(
      ZGetListParams.merge(
        z.object({
          offerId: z.number().optional(),
          categoryId: z.number().optional(),
          isCurrentUser: z.boolean().optional(),
          matchPreferences: z.boolean().optional(),
        })
      )
    )
    .query(async ({ ctx, input }) => {
      const {
        perPage,
        page,
        sort,
        categoryId,
        offerId,
        isCurrentUser,
        matchPreferences,
      } = input;

      let where = {
        ...payloadWhereOfferIsValid(),
      } as Where;

      if (categoryId) {
        where.category = {
          equals: categoryId,
        };
      } else if (matchPreferences) {
        const currentUser = await ctx.payload.findByID({
          collection: "users",
          id: ctx.session.id,
        });

        if (currentUser) {
          where.category = {
            in: currentUser.preferences
              ?.map((p) => {
                if (typeof p === "object") return p.id;
              })
              .filter((p) => !!p),
          };
        }
      }

      if (offerId) {
        where.id = {
          equals: offerId,
        };
      }

      const offers = await ctx.payload.find({
        collection: "offers",
        limit: perPage,
        page: page,
        where: where as Where,
        sort,
      });

      const myUnusedCoupons = await ctx.payload.find({
        collection: "coupons",
        depth: 0,
        limit: 1000,
        where: {
          used: { equals: false },
          user: { equals: ctx.session.id },
        },
      });

      const couponCountOfOffersPromises = offers.docs.map((offer) =>
        ctx.payload.find({
          collection: "coupons",
          limit: 1,
          where: {
            offer: {
              equals: offer.id,
            },
            used: { equals: false },
            user: { exists: false },
          },
        })
      );

      const couponCountOfOffers = await Promise.all(
        couponCountOfOffersPromises
      );

      const offersFiltered = offers.docs.filter((offer, index) => {
        const myUnusedOfferCoupons = myUnusedCoupons.docs.find(
          (coupon) => coupon.offer === offer.id
        );

        if (
          !isCurrentUser &&
          (offer.kind === "voucher_pass" || offer.kind === "code_space")
        )
          return true;
        else if (isCurrentUser) return !!myUnusedOfferCoupons;

        const coupons = couponCountOfOffers[index];
        return (!!coupons && !!coupons.docs.length) || !!myUnusedOfferCoupons;
      });

      return {
        data: offersFiltered as OfferIncluded[],
        metadata: { page, count: offers.docs.length },
      };
    }),

  getById: userProtectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const { id } = input;

      const offer = await ctx.payload.findByID({
        collection: "offers",
        id,
      });

      return { data: offer as OfferIncluded };
    }),
});
