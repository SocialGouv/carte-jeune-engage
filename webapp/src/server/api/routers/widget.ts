import { TRPCError } from "@trpc/server";
import jwt from "jsonwebtoken";
import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  widgetTokenProtectedProcedure,
} from "~/server/api/trpc";
import { ZWidgetToken } from "~/server/types";
import {
  decryptData,
  encryptData,
  generateRandomPassword,
} from "~/utils/tools";
import { changeUserPassword } from "./user";

export const widgetRouter = createTRPCRouter({
  generateToken: publicProcedure
    .input(z.object({ user_id: z.string(), api_key: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { user_id, api_key } = input;

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

      const jwtSecret = process.env.WIDGET_SECRET_JWT;
      const encryptionSecret = process.env.WIDGET_SECRET_DATA_ENCRYPTION;

      if (!jwtSecret || !encryptionSecret) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Server configuration error",
        });
      }

      const encryptedUserId = encryptData(user_id, encryptionSecret);

      const token = jwt.sign({ user_id: encryptedUserId }, jwtSecret, {
        expiresIn: "1d",
      });

      return {
        data: {
          widgetToken: token,
        },
      };
    }),

  login: widgetTokenProtectedProcedure
    .input(z.object({ widget_token: z.string(), user_id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { user_id, widget_token } = input;

      const decoded = jwt.verify(widget_token, process.env.WIDGET_SECRET_JWT!);
      const tokenObject = ZWidgetToken.parse(decoded);
      const cejUserId = decryptData(
        tokenObject.user_id,
        process.env.WIDGET_SECRET_DATA_ENCRYPTION!
      );

      if (cejUserId !== user_id)
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Invalid user",
        });

      const users = await ctx.payload.find({
        collection: "users",
        where: {
          cej_id: {
            equals: cejUserId,
          },
        },
      });

      const user = users.docs[0];

      if (!user)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });

      const tmpPassword = generateRandomPassword(16);

      await changeUserPassword(ctx.payload, user.id, tmpPassword);

      const session = await ctx.payload.login({
        collection: "users",
        data: {
          email: user.email,
          password: tmpPassword,
        },
      });

      await changeUserPassword(
        ctx.payload,
        user.id,
        generateRandomPassword(16),
        true
      );

      return {
        data: session,
      };
    }),
});
