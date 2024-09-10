import { createTRPCRouter } from "~/server/api/trpc";

import { userRouter } from "./routers/user";
import { categoryRouter } from "./routers/category";
import { offerRouter } from "./routers/offer";
import { couponRouter } from "./routers/coupon";
import { partnerRouter } from "./routers/partner";
import { globalsRouter } from "./routers/globals";
import { savingRouter } from "./routers/saving";
import { permissionRouter } from "./routers/permission";
import { tagRouter } from "./routers/tag";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  user: userRouter,
  category: categoryRouter,
  globals: globalsRouter,
  offer: offerRouter,
  coupon: couponRouter,
  partner: partnerRouter,
  saving: savingRouter,
  permission: permissionRouter,
  tag: tagRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
