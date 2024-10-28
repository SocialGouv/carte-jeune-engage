import { TRPCError } from "@trpc/server";
import { File } from "payload/dist/uploads/types";
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
  publicProcedure,
  userOrWidgetProtectedProcedure,
  userProtectedProcedure,
  widgetTokenProtectedProcedure,
} from "~/server/api/trpc";
import { ZGetListParams, ZObizOffer } from "~/server/types";
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

      const currentUserCoupons = await ctx.payload.find({
        collection: "coupons",
        depth: 0,
        limit: 1000,
        where: {
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
          const myOfferCoupon = currentUserCoupons.docs.find(
            (coupon) => coupon.offer === offer.id
          );
          return {
            ...offer,
            userCoupon: myOfferCoupon,
          };
        })
        .filter((offer, index) => {
          const myUnusedOfferCoupon = currentUserCoupons.docs
            .filter((coupon) => !coupon.used)
            .find((coupon) => coupon.offer === offer.id);

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

  insertObizOffers: publicProcedure
    .input(z.object({ obiz_offers: z.array(ZObizOffer), api_key: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { obiz_offers, api_key } = input;

      const apiKey = await ctx.payload.find({
        collection: "apikeys",
        where: {
          key: { equals: api_key },
        },
      });

      if (!apiKey.docs.length) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Your API KEY is not authorized",
        });
      }

      const categories = await ctx.payload.find({
        collection: "categories",
        limit: 100,
      });

      const partners = await ctx.payload.find({
        collection: "partners",
        limit: 100,
      });

      const created_offers: Offer[] = [];
      const updated_offers: Offer[] = [];

      for (const obiz_offer of obiz_offers) {
        try {
          const existingOffers = await ctx.payload.find({
            collection: "offers",
            where: {
              obiz_id: { equals: obiz_offer.obiz_id },
            },
          });
          const existingOffer = existingOffers.docs[0];

          if (!!existingOffer) {
            let updatedData: {
              title?: string;
              formatedTitle?: string;
              validityTo?: string;
              articles?: any[];
            } = {};

            if (existingOffer.validityTo !== obiz_offer.validityTo) {
              updatedData.validityTo = obiz_offer.validityTo;
            }

            if (existingOffer.title !== obiz_offer.title) {
              updatedData.title = obiz_offer.title;
              updatedData.formatedTitle = obiz_offer.formatedTitle;
            }

            for (const obiz_article of obiz_offer.articles) {
              const existingArticle = existingOffer.articles?.find(
                (article) => article.reference === obiz_article.reference
              );

              if (!existingArticle) {
                updatedData.articles = [
                  ...obiz_offer.articles,
                  ...(updatedData.articles || []),
                  obiz_article,
                ];
              }
            }

            if (Object.keys(updatedData).length > 0) {
              const offer = await ctx.payload.update({
                collection: "offers",
                id: existingOffer.id,
                data: updatedData,
              });

              updated_offers.push(offer);
            }

            continue;
          }

          const category_ids = categories.docs
            .filter((category) =>
              obiz_offer.categories.includes(category.label)
            )
            .map((cat) => cat.id);

          let partner = partners.docs.find(
            (p) => p.name === obiz_offer.partner.name
          );

          if (!partner) {
            const response = await fetch(
              obiz_offer.partner.icon_url ||
                "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg"
            );
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const icon: File = {
              data: buffer,
              mimetype: response.headers.get("content-type") || "image/png",
              name: `${obiz_offer.partner.name.toLowerCase().replace(/\s+/g, "-")}.png`,
              size: buffer.length,
            };

            const mediaIcon = await ctx.payload.create({
              collection: "media",
              file: icon,
              data: {
                alt: `${obiz_offer.partner.name.toLowerCase()} icon`,
              },
            });

            partner = await ctx.payload.create({
              collection: "partners",
              data: {
                name: obiz_offer.partner.name,
                color: obiz_offer.partner.color || "#000000",
                icon: mediaIcon.id,
              },
            });
          }

          const offer = await ctx.payload.create({
            collection: "offers",
            data: {
              ...obiz_offer,
              partner: partner.id,
              category: category_ids,
            },
          });

          created_offers.push(offer);
        } catch (error) {
          console.error(
            `Error processing offer for ${obiz_offer.partner.name}:`,
            error
          );
        }
      }

      return {
        created_offers,
        updated_offers,
      };
    }),
});
