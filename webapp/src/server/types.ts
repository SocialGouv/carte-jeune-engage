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

export type TGetListParams = z.infer<typeof ZGetListParams>;
