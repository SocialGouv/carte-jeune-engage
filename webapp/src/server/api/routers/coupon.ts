import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { Coupon, Media, Offer, Partner, User } from "~/payload/payload-types";
import { createTRPCRouter, userProtectedProcedure } from "~/server/api/trpc";
import { payloadWhereOfferIsValid } from "~/utils/tools";

export interface CouponIncluded extends Coupon {
  offer: Offer & { icon: Media; partner: Partner };
  userRouter: User;
}

export const couponRouter = createTRPCRouter({
  getOne: userProtectedProcedure
    .input(z.object({ offer_id: z.number() }))
    .query(async ({ ctx, input }) => {
      const { offer_id } = input;

      const nowDate = new Date().toISOString().split("T")[0];

      const coupons = await ctx.payload.find({
        collection: "coupons",
        depth: 2,
        where: {
          and: [
            { offer: { equals: offer_id } },
            { user: { equals: ctx.session.id } },
            {
              ...payloadWhereOfferIsValid("offer"),
            },
            { used: { equals: false } },
          ],
        },
      });

      return { data: coupons.docs[0] as CouponIncluded };
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
            ],
          },
        });

        const couponsFiltered = coupons.docs.filter(
          (coupon) => coupon.user === undefined || coupon.user === null
        );

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
});
