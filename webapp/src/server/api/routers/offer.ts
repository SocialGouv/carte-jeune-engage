import { TRPCError } from "@trpc/server";
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
import { areObjectsEqual, payloadWhereOfferIsValid } from "~/utils/tools";
import fs from "fs/promises";
import path from "path";
import os from "os";
import _ from "lodash";

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

const downloadAndCreateMedia = async (
  iconUrl: string,
  partnerName: string,
  ctx: any
) => {
  try {
    const cleanPartnerName = partnerName
      .toLowerCase()
      .replace(/[&\/\\#,+()$~%.'":*?<>{}!@^|=;[\]]/g, "")
      .replace(/\s+/g, "-")
      .trim();

    const tempFileName = `${cleanPartnerName}-${Date.now()}.png`;
    const tempFilePath = path.join(os.tmpdir(), tempFileName);

    const response = await fetch(iconUrl);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await fs.writeFile(tempFilePath, buffer);

    const mediaIcon = await ctx.payload.create({
      collection: "media",
      filePath: tempFilePath,
      data: {
        alt: `${partnerName.toLowerCase()} icon`,
      },
    });

    await fs.unlink(tempFilePath);

    return mediaIcon;
  } catch (error) {
    console.error("Error processing icon:", error);
    throw error;
  }
};

export const offerRouter = createTRPCRouter({
  getListOfAvailables: userProtectedProcedure
    .input(
      ZGetListParams.merge(
        z.object({
          offerIds: z.array(z.number()).optional(),
          tagIds: z.array(z.number()).optional(),
          categoryId: z.number().optional(),
          kinds: z
            .array(
              z.enum([
                "code",
                "code_space",
                "code_obiz",
                "voucher",
                "voucher_pass",
              ])
            )
            .optional(),
          isCurrentUser: z.boolean().optional(),
          matchPreferences: z.boolean().optional(),
          searchOnPartner: z.string().optional(),
          shuffle: z.boolean().optional(),
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
        shuffle,
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
        sort: "-usedAt",
        where: {
          user: { equals: ctx.session.id },
        },
      });

      const resultUniqueOffersWithAvailableCoupons =
        await ctx.payload.db.pool.query(
          `
				SELECT DISTINCT offers_id
				FROM coupons_rels cr_offers
				WHERE cr_offers.path = 'offer'
				AND cr_offers.offers_id = ANY($1)
				AND NOT EXISTS (
						SELECT 1 
						FROM coupons_rels cr_users
						WHERE cr_users.parent_id = cr_offers.parent_id 
						AND cr_users.path = 'user'
				)
				`,
          [offers.docs.map((o) => o.id)]
        );
      const CJE_OfferIdsAvailable =
        resultUniqueOffersWithAvailableCoupons.rows.map(
          (row: { offers_id: number }) => row.offers_id
        ) as number[];

      let offersFiltered = (offers.docs as OfferIncludedWithUserCoupon[])
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

          if (offer.source === "obiz")
            return (
              offer.articles &&
              !!offer.articles.filter((a) => a.available).length
            );
          else if (
            !isCurrentUser &&
            (offer.kind === "voucher_pass" || offer.kind === "code_space")
          )
            return true;
          else if (isCurrentUser) return !!myUnusedOfferCoupon;

          const hasAvailableCoupons = CJE_OfferIdsAvailable.includes(offer.id);
          return hasAvailableCoupons || !!myUnusedOfferCoupon;
        });

      if (shuffle) {
        offersFiltered = _.shuffle(offersFiltered);
      }

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
            .array(
              z.enum([
                "code",
                "code_space",
                "code_obiz",
                "voucher",
                "voucher_pass",
              ])
            )
            .optional(),
          searchOnPartner: z.string().optional(),
          shuffle: z.boolean().optional(),
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
        shuffle,
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

      const resultUniqueOffersWithAvailableCoupons =
        await ctx.payload.db.pool.query(
          `
				SELECT DISTINCT offers_id
				FROM coupons_rels cr_offers
				WHERE cr_offers.path = 'offer'
				AND cr_offers.offers_id = ANY($1)
				AND NOT EXISTS (
						SELECT 1 
						FROM coupons_rels cr_users
						WHERE cr_users.parent_id = cr_offers.parent_id 
						AND cr_users.path = 'user'
				)
				`,
          [offers.docs.map((o) => o.id)]
        );
      const CJE_OfferIdsAvailable =
        resultUniqueOffersWithAvailableCoupons.rows.map(
          (row: { offers_id: number }) => row.offers_id
        ) as number[];

      let offersFiltered = (
        offers.docs as OfferIncludedWithUserCoupon[]
      ).filter((offer, index) => {
        if (offer.source === "obiz")
          return (
            offer.articles && !!offer.articles.filter((a) => a.available).length
          );

        if (offer.kind === "voucher_pass" || offer.kind === "code_space")
          return true;

        const hasAvailableCoupons = CJE_OfferIdsAvailable.includes(offer.id);
        return hasAvailableCoupons;
      });

      if (shuffle) {
        offersFiltered = _.shuffle(offersFiltered);
      }

      return {
        data: offersFiltered,
        metadata: { page, count: offers.docs.length },
      };
    }),

  getById: userOrWidgetProtectedProcedure
    .input(
      z.object({ id: z.number(), source: z.enum(["cje", "obiz"]).optional() })
    )
    .query(async ({ ctx, input }) => {
      const { id, source } = input;

      const where: Where = {
        id: { equals: id },
        published: { equals: true },
      };

      if (source) {
        where.source = { equals: source };
      }

      const offers = await ctx.payload.find({
        collection: "offers",
        where,
      });
      const offer = offers.docs[0];

      if (!offer) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Offer not found",
        });
      }

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

        return { data: true };
      }

      return { data: false };
    }),

  insertObizOffers: publicProcedure
    .input(z.object({ obiz_offers: z.array(ZObizOffer), api_key: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { obiz_offers, api_key } = input;

      const apiKey = await ctx.payload.find({
        collection: "apikeys",
        limit: 100,
      });
      const hasAccess = apiKey.docs.some((apiKey) => apiKey.key === api_key);

      if (!hasAccess) {
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
              formatedTitle?: string;
              validityTo?: string;
              articles?: any[];
            } = {};

            if (existingOffer.validityTo !== obiz_offer.validityTo) {
              updatedData.validityTo = obiz_offer.validityTo;
            }

            for (const obiz_article of obiz_offer.articles) {
              const existingArticle = existingOffer.articles?.find(
                (article) => article.reference === obiz_article.reference
              );

              if (!existingArticle) {
                updatedData.articles = [
                  ...(updatedData.articles || []),
                  {
                    ...obiz_article,
                    obizJson: JSON.parse(obiz_article.obizJson),
                  },
                ];
              } else {
                const hasDifferentJson = !areObjectsEqual(
                  existingArticle.obizJson,
                  JSON.parse(obiz_article.obizJson)
                );
                if (hasDifferentJson) {
                  updatedData.articles = [
                    ...(updatedData.articles || []),
                    {
                      id: existingArticle.id,
                      ...obiz_article,
                      obizJson: JSON.parse(obiz_article.obizJson),
                    },
                  ];
                }
              }
            }

            if (Object.keys(updatedData).length > 0) {
              if (updatedData.articles && !!updatedData.articles.length) {
                const updateArticlesReferences = updatedData.articles?.map(
                  (uArticle) => uArticle.reference
                );
                updatedData.articles = [
                  ...(existingOffer.articles || [])?.filter(
                    (article) =>
                      !updateArticlesReferences.includes(article.reference)
                  ),
                  ...updatedData.articles,
                ]
                  .sort((a, b) => {
                    if (!a.validityTo && !b.validityTo) return 0;
                    if (!a.validityTo) return 1;
                    if (!b.validityTo) return -1;

                    return (
                      new Date(a.validityTo).getTime() -
                      new Date(b.validityTo).getTime()
                    );
                  })
                  .map((article) => ({
                    ...article,
                    image:
                      typeof article.image === "object"
                        ? article.image.id
                        : article.image,
                  }));
              }

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
            const mediaIcon = await downloadAndCreateMedia(
              obiz_offer.partner.icon_url ||
                "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg",
              obiz_offer.partner.name,
              ctx
            );

            partner = await ctx.payload.create({
              collection: "partners",
              data: {
                name: obiz_offer.partner.name,
                color: obiz_offer.partner.color || "#000000",
                icon: mediaIcon.id,
              },
            });
          }

          for (const article of obiz_offer.articles) {
            if (article.image_url) {
              const mediaIcon = await downloadAndCreateMedia(
                obiz_offer.partner.icon_url ||
                  "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg",
                obiz_offer.partner.name,
                ctx
              );

              article.image = mediaIcon.id;
            }

            article.obizJson = JSON.parse(article.obizJson);
          }

          const offer = await ctx.payload.create({
            collection: "offers",
            data: {
              ...obiz_offer,
              published: false,
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

  synchronizeObizOffer: publicProcedure
    .input(
      z.object({
        article_id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { article_id } = input;

      const offers = await ctx.payload.find({
        collection: "offers",
        where: {
          "articles.obiz_id": { equals: article_id },
        },
        depth: 0,
      });
      let offer = offers.docs[0];

      if (!offer) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Offer for this article not found.`,
        });
      }

      try {
        let updateArticles = false;
        const [resultGetArticle] = await ctx.soapObizClient.GET_ARTICLEAsync({
          partenaire_id: process.env.OBIZ_PARTNER_ID,
          articles_id: article_id,
        });

        const article_actif =
          resultGetArticle?.GET_ARTICLEResult?.diffgram?.NewDataSet?.Articles
            ?.articles_actif === "true";

        if (article_actif !== undefined) {
          offer.articles = (offer.articles || []).map((article) => {
            if (
              article.obiz_id === article_id &&
              article.available !== article_actif
            ) {
              article.available = article_actif;
              updateArticles = true;
            }
            return article;
          });

          if (updateArticles) {
            offer = await ctx.payload.update({
              collection: "offers",
              id: offer.id,
              data: {
                articles: (offer.articles as any) || [],
              },
              depth: 0,
            });
          }
        }

        return { offer, updateArticles, article_actif };
      } catch (error) {
        console.log(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `An error occurred while synchronizing the offer with article ${article_id}`,
        });
      }
    }),
});
