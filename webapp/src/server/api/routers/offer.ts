import { Where } from "payload/types";
import { z } from "zod";
import {
  Category,
  Coupon,
  Media,
  Offer,
  Partner,
  Tag,
} from "~/payload/payload-types";
import {
  createTRPCRouter,
  userOrWidgetProtectedProcedure,
  userProtectedProcedure,
  widgetTokenProtectedProcedure,
} from "~/server/api/trpc";
import { ZGetListParams } from "~/server/types";
import { payloadWhereOfferIsValid } from "~/utils/tools";

export interface OfferIncluded extends Offer {
  image: Media;
  partner: Partner & { icon: Media };
  category: (Category & { icon: Media })[];
  tags: (Tag & { icon: Media })[];
  imageOfEligibleStores: Media;
}

export interface OfferIncludedWithUserCoupon extends OfferIncluded {
  userCoupon?: Coupon;
}

export const offerRouter = createTRPCRouter({
  getListOfAvailables: userProtectedProcedure
    .input(
      ZGetListParams.merge(
        z.object({
          offerIds: z.array(z.number()).optional(),
          tagIds: z.array(z.number()).optional(),
          categoryId: z.number().optional(),
          kinds: z
            .array(z.enum(["code", "code_space", "voucher", "voucher_pass"]))
            .optional(),
          isCurrentUser: z.boolean().optional(),
          matchPreferences: z.boolean().optional(),
          searchOnPartner: z.string().optional(),
        })
      )
    )
    .query(async ({ ctx, input }) => {
      const {
        perPage,
        page,
        sort,
        categoryId,
        offerIds,
        isCurrentUser,
        matchPreferences,
        kinds,
        tagIds,
        searchOnPartner,
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

      if (offerIds) {
        where.id = {
          in: offerIds,
        };
      }

      if (tagIds) {
        where.tags = {
          in: tagIds,
        };
      }

      if (kinds && kinds.length) {
        where.kind = {
          in: kinds,
        };
      }

      if (searchOnPartner) {
        where["partner.name"] = {
          like: searchOnPartner,
        };
      }

      const offers = await ctx.payload.find({
        collection: "offers",
        limit: perPage,
        page: page,
        where: where as Where,
        sort: sort,
        depth: 3,
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

      const offersFiltered = (offers.docs as OfferIncludedWithUserCoupon[])
        .map((offer) => {
          const myUnusedOfferCoupon = myUnusedCoupons.docs.find(
            (coupon) => coupon.offer === offer.id
          );
          return {
            ...offer,
            userCoupon: myUnusedOfferCoupon,
          };
        })
        .filter((offer, index) => {
          const myUnusedOfferCoupon = offer.userCoupon;

          if (
            !isCurrentUser &&
            (offer.kind === "voucher_pass" || offer.kind === "code_space")
          )
            return true;
          else if (isCurrentUser) return !!myUnusedOfferCoupon;

          const coupons = couponCountOfOffers[index];
          return (!!coupons && !!coupons.docs.length) || !!myUnusedOfferCoupon;
        });

      return {
        data: offersFiltered,
        metadata: { page, count: offers.docs.length },
      };
    }),

  getWidgetListOfAvailables: widgetTokenProtectedProcedure
    .input(
      ZGetListParams.merge(
        z.object({
          tagIds: z.array(z.number()).optional(),
          categoryId: z.number().optional(),
          kinds: z
            .array(z.enum(["code", "code_space", "voucher", "voucher_pass"]))
            .optional(),
          searchOnPartner: z.string().optional(),
        })
      )
    )
    .query(async ({ ctx, input }) => {
      const {
        tagIds,
        categoryId,
        kinds,
        searchOnPartner,
        perPage,
        page,
        sort,
      } = input;

      let where = {
        ...payloadWhereOfferIsValid(),
      } as Where;

      if (categoryId) {
        where.category = {
          equals: categoryId,
        };
      }

      if (tagIds) {
        where.tags = {
          in: tagIds,
        };
      }

      if (kinds) {
        where.kind = {
          in: kinds,
        };
      }

      if (searchOnPartner) {
        where["partner.name"] = {
          like: searchOnPartner,
        };
      }

      const offers = await ctx.payload.find({
        collection: "offers",
        limit: perPage,
        page: page,
        where: where as Where,
        sort: sort,
        depth: 3,
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

      const offersFiltered = (
        offers.docs as OfferIncludedWithUserCoupon[]
      ).filter((offer, index) => {
        if (offer.kind === "voucher_pass" || offer.kind === "code_space")
          return true;

        const coupons = couponCountOfOffers[index];
        return !!coupons && !!coupons.docs.length;
      });

      return {
        data: offersFiltered,
        metadata: { page, count: offers.docs.length },
      };
    }),

  getById: userOrWidgetProtectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const { id } = input;

      const offer = await ctx.payload.findByID({
        collection: "offers",
        id,
      });

      return { data: offer as OfferIncluded };
    }),

  increaseNbSeen: userProtectedProcedure
    .input(
      z.object({
        offer_id: z.number(),
      })
    )
    .mutation(async ({ ctx, input: userInput }) => {
      const { offer_id } = userInput;

      const offer = await ctx.payload.findByID({
        collection: "offers",
        id: offer_id,
      });

      if (offer) {
        await ctx.payload.update({
          collection: "offers",
          id: offer_id,
          data: {
            nbSeen: (offer.nbSeen || 0) + 1,
          },
        });

        return { data: "Offer nbSeen increased" };
      }

      return { data: "Offer not found" };
    }),
});
