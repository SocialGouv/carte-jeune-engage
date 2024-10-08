import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { EmailAuthToken, User } from "~/payload/payload-types";
import {
  createTRPCRouter,
  publicProcedure,
  userProtectedProcedure,
} from "~/server/api/trpc";
import { changeUserPassword } from "./user";
import { generateRandomPassword } from "~/utils/tools";

interface EmailAuthTokenWithUser extends EmailAuthToken {
  user: User;
}

export const emailAuthTokenRouter = createTRPCRouter({
  verifyToken: publicProcedure
    .input(z.string())
    .mutation(async ({ ctx, input: token }) => {
      const emailAuthTokens = await ctx.payload.find({
        collection: "email_auth_tokens",
        where: { token: { equals: token } },
        depth: 2,
      });

      const emailAuthToken = emailAuthTokens.docs[0] as EmailAuthTokenWithUser;

      if (!emailAuthToken)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Token not found",
        });

      const tmpPassword = generateRandomPassword(16);

      await changeUserPassword(
        ctx.payload,
        emailAuthToken.user.id,
        tmpPassword
      );

      const userSession = await ctx.payload.login({
        collection: "users",
        data: {
          email: emailAuthToken.user.email,
          password: tmpPassword,
        },
      });

      await changeUserPassword(
        ctx.payload,
        emailAuthToken.user.id,
        generateRandomPassword(16)
      );

      await ctx.payload.delete({
        collection: "email_auth_tokens",
        where: { user: { equals: emailAuthToken.user.id } },
      });

      return {
        data: userSession,
      };
    }),
});
