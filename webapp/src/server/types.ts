import { z } from "zod";

export const ZGetListParams = z.object({
  page: z.number(),
  perPage: z.number(),
  sort: z.string().optional(),
});

export const ZWidgetToken = z.object({
  user_id: z.string(),
  iat: z.number(),
  exp: z.number(),
});

export const ZObizPartner = z.object({
  name: z.string(),
  color: z.string().optional(),
  icon_url: z.string().optional(),
});

export const ZObizArticle = z.object({
  available: z.boolean(),
  name: z.string(),
  reference: z.string(),
  reductionPercentage: z.number(),
  validityTo: z.string(),
  kind: z.enum(["fixed_price", "variable_price"]),
  obizJson: z.string(),
  publicPrice: z.number().optional(),
  price: z.number().optional(),
  minimumPrice: z.number().optional(),
  maximumPrice: z.number().optional(),
});

export const ZObizOffer = z.object({
  title: z.string(),
  formatedTitle: z.string(),
  obiz_id: z.string().uuid(),
  categories: z.array(z.string()),
  source: z.literal("obiz"),
  kind: z.literal("code_obiz"),
  partner: ZObizPartner,
  articles: z.array(ZObizArticle),
  validityTo: z.string(),
});

export type ObizOffer = z.infer<typeof ZObizOffer>;

export type TGetListParams = z.infer<typeof ZGetListParams>;
