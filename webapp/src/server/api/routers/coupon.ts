import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  Coupon,
  Couponsignal,
  Media,
  Offer,
  Partner,
  User,
} from "~/payload/payload-types";
import { createTRPCRouter, userProtectedProcedure } from "~/server/api/trpc";
import { getHtmlSignalOrder } from "~/utils/emailHtml";
import { isOlderThan24Hours, payloadWhereOfferIsValid } from "~/utils/tools";

export interface CouponIncluded extends Coupon {
  offer: Offer & { partner: Partner & { icon: Media } };
  user: User;
}

export const couponRouter = createTRPCRouter({
  getOne: userProtectedProcedure
    .input(z.object({ offer_id: z.number() }))
    .query(async ({ ctx, input }) => {
      const { offer_id } = input;

      const coupons = await ctx.payload.find({
        collection: "coupons",
        depth: 3,
        sort: "-usedAt",
        where: {
          and: [
            { offer: { equals: offer_id } },
            { user: { equals: ctx.session.id } },
            {
              ...payloadWhereOfferIsValid("offer"),
            },
          ],
        },
      });

      return { data: coupons.docs[0] as CouponIncluded };
    }),

  getList: userProtectedProcedure.query(async ({ ctx }) => {
    const coupons = await ctx.payload.find({
      collection: "coupons",
      depth: 3,
      where: {
        and: [
          { user: { equals: ctx.session.id } },
          {
            ...payloadWhereOfferIsValid("offer"),
          },
          { used: { equals: false } },
        ],
      },
    });

    return { data: coupons.docs as CouponIncluded[] };
  }),

  assignToUser: userProtectedProcedure
    .input(z.object({ offer_id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const { offer_id } = input;

      const currentOffer = await ctx.payload.findByID({
        collection: "offers",
        id: offer_id,
      });

      if (!currentOffer)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Offer not found",
        });

      const userOfferCoupon = await ctx.payload.find({
        collection: "coupons",
        sort: "-usedAt",
        where: {
          and: [
            { offer: { equals: offer_id } },
            { user: { equals: ctx.session.id } },
          ],
        },
      });

      if (!!userOfferCoupon.docs.length) {
        if (currentOffer.cumulative) {
          const hasUnusedCoupon = userOfferCoupon.docs.some(
            (coupon) => !coupon.used
          );
          if (hasUnusedCoupon) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message:
                "User must used his coupon before taking another one on a cumulative offer",
            });
          }

          const lastUsedCoupon = userOfferCoupon.docs.find(
            (coupon) => coupon.used
          );
          if (
            lastUsedCoupon &&
            lastUsedCoupon.assignUserAt &&
            !isOlderThan24Hours(lastUsedCoupon.assignUserAt)
          ) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "User last used coupon is not older than 24 hours",
            });
          }
        } else {
          throw new TRPCError({
            code: "FORBIDDEN",
            message:
              "User can't take several coupons on a non cumulative offer",
          });
        }
      }

      let availableCoupon;

      if (currentOffer.kind === "voucher" || currentOffer.kind === "code") {
        const coupons = await ctx.payload.find({
          collection: "coupons",
          where: {
            and: [
              { offer: { equals: offer_id } },
              {
                ...payloadWhereOfferIsValid("offer"),
              },
              { used: { equals: false } },
              { user: { exists: false } },
            ],
          },
        });

        const couponsFiltered = coupons.docs;

        if (couponsFiltered.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "No coupons available for this offer",
          });
        }

        availableCoupon = couponsFiltered[0] as CouponIncluded;
      } else {
        const tmpNewCoupon = await ctx.payload.create({
          collection: "coupons",
          data: { code: `fake-code-${offer_id}`, offer: offer_id },
        });

        availableCoupon = tmpNewCoupon as CouponIncluded;
      }

      const couponData = availableCoupon;

      const checkIfCouponIsAlreadyAssigned = await ctx.payload.find({
        collection: "coupons",
        where: {
          and: [
            { user: { equals: ctx.session.id } },
            { offer: { equals: offer_id } },
            {
              ...payloadWhereOfferIsValid("offer"),
            },
            { used: { equals: false } },
          ],
        },
      });

      if (checkIfCouponIsAlreadyAssigned.docs.length > 0) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "An active coupon is already assigned to user",
        });
      }

      const updatedCoupon = await ctx.payload.update({
        collection: "coupons",
        id: couponData.id,
        data: { user: ctx.session.id },
      });

      return { data: updatedCoupon };
    }),

  usedFromUser: userProtectedProcedure
    .input(z.object({ coupon_id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const { coupon_id } = input;

      const coupon = await ctx.payload.findByID({
        collection: "coupons",
        id: coupon_id,
        depth: 0,
      });

      if (!coupon)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Coupon not found",
        });

      if (coupon.user !== ctx.session.id)
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Coupon not assigned to user",
        });

      const updatedCoupon = await ctx.payload.update({
        collection: "coupons",
        id: coupon_id,
        data: { used: true },
      });

      return { data: updatedCoupon };
    }),

  createSignal: userProtectedProcedure
    .input(
      z.object({
        id: z.number(),
        cause: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, cause } = input;

      const existingCouponSignals = await ctx.payload.find({
        collection: "couponsignals",
        where: {
          coupon: { equals: id },
        },
      });
      const existingCouponSignal = existingCouponSignals.docs[0];

      if (!!existingCouponSignal) {
        return {
          data: existingCouponSignal,
        };
      }

      const couponSignal = await ctx.payload.create({
        collection: "couponsignals",
        data: {
          coupon: id,
          cause,
        },
        depth: 1,
      });

      const users = await ctx.payload.find({
        collection: "users",
        limit: 1,
        page: 1,
        where: {
          id: { equals: ctx.session.id },
        },
      });
      const currentUser = users.docs[0];

      ctx.payload.sendEmail({
        from: process.env.SMTP_FROM_ADDRESS,
        to: currentUser.userEmail,
        subject: "Signalement d'une commande défaillante",
        html: getHtmlSignalOrder(currentUser, {
          coupon: couponSignal.coupon as Coupon,
        }),
      });

      return {
        data: couponSignal,
      };
    }),
});
