import { TRPCError } from "@trpc/server";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { encryptData } from "~/utils/tools";

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
});
