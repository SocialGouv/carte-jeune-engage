import { TRPCError } from "@trpc/server";
import { Payload } from "payload";
import { generatePasswordSaltHash } from "payload/dist/auth/strategies/local/generatePasswordSaltHash";
import APIError from "payload/dist/errors/APIError";
import { z } from "zod";
import { EmailAuthToken, Media, User } from "~/payload/payload-types";
import {
  createTRPCRouter,
  publicProcedure,
  userProtectedProcedure,
} from "~/server/api/trpc";
import { getHtmlLoginByEmail } from "~/utils/emailHtml";
import {
  generateRandomPassword,
  maskEmail,
  payloadOrPhoneNumberCheck,
} from "~/utils/tools";

interface EmailAuthTokenWithUser extends EmailAuthToken {
  user: User;
}

export interface UserIncluded extends User {
  image: Media;
}

export const changeUserPassword = async (
  payload: Payload,
  id: number,
  password: string,
  removeOtpRequestToken?: boolean
) => {
  const { hash, salt } = await generatePasswordSaltHash({
    password,
  });

  let updateData: { hash: string; salt: string; otp_request_token?: null } = {
    hash,
    salt,
  };

  if (removeOtpRequestToken) updateData.otp_request_token = null;

  await payload.update({
    collection: "users",
    id,
    data: updateData,
  });
};

const generateAndSendOTP = async (
  payload: Payload,
  data: { phone_number: string; user_email?: string; cej_id?: string },
  firstLogin: boolean
) => {
  const { phone_number, user_email, cej_id } = data;
  const hasDialingCode = phone_number.startsWith("+");
  const email = `${
    hasDialingCode ? `0${phone_number.substring(3)}` : phone_number
  }@cje.loc`;

  const octopushResponse = await fetch(
    "https://api.octopush.com/v1/public/service/otp/generate",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-login": process.env.OCTOPUSH_API_LOGIN as string,
        "api-key": process.env.OCTOPUSH_API_KEY as string,
      },
      body: JSON.stringify({
        phone_number: hasDialingCode
          ? phone_number
          : `+33${phone_number.substring(1)}`,
        text: "Votre code de vérification Carte Jeune Engagé est ",
        code_length: 4,
        validity_period: 86400, // 24H
      }),
    }
  )
    .then((response) => response.json())
    .then((data) => data);

  if (octopushResponse.code !== 0) {
    console.log(`Octopush error code : ${octopushResponse.code}`);
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Octopush error",
      cause: octopushResponse.message,
    });
  } else if (!!octopushResponse.otp_request_token) {
    if (firstLogin) {
      console.log("tying to create : ", {
        email: email,
        otp_request_token: octopushResponse.otp_request_token,
        password: generateRandomPassword(16),
        phone_number: phone_number,
        userEmail: user_email,
        cej_id: cej_id,
      });
      await payload.create({
        collection: "users",
        data: {
          email: email,
          otp_request_token: octopushResponse.otp_request_token,
          password: generateRandomPassword(16),
          phone_number: phone_number,
          userEmail: user_email,
          cej_id: cej_id,
        },
      });
    } else {
      await payload.update({
        collection: "users",
        where: {
          email: { equals: email },
        },
        data: {
          otp_request_token: octopushResponse.otp_request_token,
        },
      });
    }
  }
};

export const userRouter = createTRPCRouter({
  register: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        phone_number: z.string(),
        firstName: z.string(),
        lastName: z.string(),
        password: z.string(),
      })
    )
    .mutation(async ({ ctx, input: userInput }) => {
      try {
        const newUser = await ctx.payload.create({
          collection: "users",
          data: userInput,
        });

        return { data: newUser };
      } catch (error: unknown) {
        if (error instanceof APIError) {
          if (
            error.data[0].field === "email" &&
            error.data[0].message.includes("registered")
          ) {
            throw new TRPCError({
              code: "CONFLICT",
              message: "Email already registered",
              cause: error,
            });
          }
        }
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Unknown error",
          cause: error,
        });
      }
    }),

  update: userProtectedProcedure
    .input(
      z.object({
        civility: z.enum(["man", "woman"]).optional(),
        birthDate: z.string().optional(),
        cejFrom: z
          .enum([
            "franceTravail",
            "missionLocale",
            "serviceCivique",
            "ecole2ndeChance",
            "epide",
          ])
          .optional(),
        timeAtCEJ: z
          .enum(["started", "lessThan3Months", "moreThan3Months"])
          .optional(),
        hasAJobIdea: z.enum(["yes", "no"]).optional(),
        projectTitle: z.string().optional(),
        projectDescription: z.string().optional(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        userEmail: z.string().email().optional(),
        address: z.string().optional(),
        preferences: z.array(z.number()).optional(),
        status_image: z.enum(["pending"]).optional(),
        image: z.number().optional(),
        notification_subscription: z.any().optional(),
        notification_status: z.enum(["enabled", "disabled"]).optional(),
      })
    )
    .mutation(async ({ ctx, input: userInput }) => {
      try {
        const user = await ctx.payload.update({
          collection: "users",
          id: ctx.session?.id,
          data: userInput,
        });

        return { data: user };
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Unknown error",
          cause: error,
        });
      }
    }),

  oldLoginUser: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      })
    )
    .mutation(async ({ ctx, input: userInput }) => {
      try {
        const user = await ctx.payload.login({
          collection: "users",
          data: userInput,
        });

        return { data: user };
      } catch (error) {
        if (error && typeof error === "object" && "status" in error) {
          if (error.status === 401) {
            throw new TRPCError({
              code: "UNAUTHORIZED",
              message: "Invalid email or password",
              cause: error,
            });
          }
        }

        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Unknown error",
          cause: error,
        });
      }
    }),

  loginUser: publicProcedure
    .input(
      z.object({
        phone_number: z.string(),
        otp: z.string(),
      })
    )
    .mutation(async ({ ctx, input: userInput }) => {
      const { phone_number, otp } = userInput;
      const hasDialingCode = phone_number.startsWith("+");

      const users = await ctx.payload.find({
        collection: "users",
        page: 1,
        limit: 1,
        where: {
          email: {
            equals: `${
              hasDialingCode ? `0${phone_number.substring(3)}` : phone_number
            }@cje.loc`,
          },
        },
      });

      const user = users.docs[0];

      if (!user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User not found",
          cause: "",
        });
      }

      if (user.userEmail && user.firstName) {
        const emailAuthTokens = await ctx.payload.find({
          collection: "email_auth_tokens",
          where: { token: { equals: otp } },
          depth: 2,
          sort: "-createdAt",
        });

        const emailAuthToken = emailAuthTokens
          .docs[0] as EmailAuthTokenWithUser;

        if (!emailAuthToken) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Token not found",
          });
        } else if (
          new Date(emailAuthToken.expiration as string).getTime() <
          new Date().getTime()
        ) {
          throw new TRPCError({
            code: "TIMEOUT",
            message: "Token expired",
          });
        }

        await ctx.payload.delete({
          collection: "email_auth_tokens",
          where: { user: { equals: emailAuthToken.user.id } },
        });
      } else {
        const octopushResponse = await fetch(
          "https://api.octopush.com/v1/public/service/otp/validate",
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "api-login": process.env.OCTOPUSH_API_LOGIN as string,
              "api-key": process.env.OCTOPUSH_API_KEY as string,
            },
            body: JSON.stringify({
              otp_request_token: user.otp_request_token,
              code: otp,
            }),
          }
        )
          .then((response) => response.json())
          .then((data) => data);

        if (octopushResponse.code === 197) {
          throw new TRPCError({
            code: "TIMEOUT",
            message: "OTP expired",
            cause: octopushResponse.message,
          });
        } else if (octopushResponse.code !== 0) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid OTP",
            cause: octopushResponse.message,
          });
        }
      }

      try {
        const email = `${
          hasDialingCode ? `0${phone_number.substring(3)}` : phone_number
        }@cje.loc`;

        await changeUserPassword(ctx.payload, user.id, otp);

        const session = await ctx.payload.login({
          collection: "users",
          data: {
            email,
            password: otp,
          },
        });

        await changeUserPassword(
          ctx.payload,
          user.id,
          generateRandomPassword(16),
          true
        );

        return { data: session };
      } catch (error) {
        if (error && typeof error === "object" && "status" in error) {
          if (error.status === 401) {
            throw new TRPCError({
              code: "UNAUTHORIZED",
              message: "Invalid phone or OTP",
              cause: error,
            });
          }
        }

        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Unknown error",
          cause: error,
        });
      }
    }),

  generateOTP: publicProcedure
    .input(
      z.object({
        phone_number: z.string(),
        user_email: z.string().optional(),
        cej_id: z.string().optional(),
      })
    )
    .output(
      z.object({
        kind: z.enum(["otp", "email"]),
      })
    )
    .mutation(async ({ ctx, input: userInput }) => {
      const { phone_number, cej_id } = userInput;

      const users = await ctx.payload.find({
        collection: "users",
        limit: 1,
        page: 1,
        where: {
          ...payloadOrPhoneNumberCheck(phone_number),
        },
      });

      if (!users.docs.length) {
        // For CEJ users, we generate an OTP only if the CEJ ID is valid
        if (cej_id) {
          await generateAndSendOTP(ctx.payload, userInput, true);
          return { kind: "otp" };
        }

        const permissions = await ctx.payload.find({
          collection: "permissions",
          limit: 1,
          page: 1,
          where: {
            ...payloadOrPhoneNumberCheck(phone_number),
          },
        });

        if (!permissions.docs.length) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Phone number does not exists on the database",
          });
        } else {
          await generateAndSendOTP(ctx.payload, userInput, true);
          return { kind: "otp" };
        }
      } else {
        const currentUser = users.docs[0];

        if (currentUser.userEmail && currentUser.firstName) {
          const token = Math.floor(1000 + Math.random() * 9000).toString();

          await ctx.payload.create({
            collection: "email_auth_tokens",
            data: {
              user: currentUser.id,
              token: token,
              expiration: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
            },
          });

          ctx.payload.sendEmail({
            from: process.env.SMTP_FROM_ADDRESS,
            to: currentUser.userEmail,
            subject: 'Connexion à "Carte jeune engagé"',
            html: getHtmlLoginByEmail(currentUser, token),
          });

          return { kind: "email" };
        } else {
          await generateAndSendOTP(ctx.payload, userInput, false);
          return { kind: "otp" };
        }
      }
    }),

  loginSupervisor: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
        cgu: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input: userInput }) => {
      const { email, password, cgu } = userInput;

      try {
        const login = await ctx.payload.login({
          collection: "supervisors",
          data: {
            email,
            password,
          },
        });

        if (cgu) {
          await ctx.payload.update({
            collection: "supervisors",
            id: login.user.id,
            data: {
              cgu: true,
            },
          });
          login.user.cgu = true;
        }

        return { data: login };
      } catch (error) {
        if (error && typeof error === "object" && "status" in error) {
          if (error.status === 401) {
            throw new TRPCError({
              code: "UNAUTHORIZED",
              message: "Invalid email or password",
              cause: error,
            });
          }
        }

        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Unknown error",
          cause: error,
        });
      }
    }),

  notEligibleEmail: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        firstName: z.string(),
        lastName: z.string(),
        registered: z.string(),
        phone_number: z.string(),
      })
    )
    .mutation(async ({ ctx, input: userInput }) => {
      const { email, firstName, lastName, registered, phone_number } =
        userInput;

      await ctx.payload.sendEmail({
        from: process.env.SMTP_FROM_ADDRESS,
        to: process.env.SMTP_FROM_ADDRESS,
        subject: "Demande d'accès à l'application",
        text: `Nouvelle demande d'accès faite sur la landing par ${firstName} ${lastName} (${email} - ${phone_number}).`,
      });
    }),

  getSecretEmailFromPhoneNumber: publicProcedure
    .input(
      z.object({
        phone_number: z.string(),
      })
    )
    .query(async ({ ctx, input: { phone_number } }) => {
      const userQuery = await ctx.payload.find({
        collection: "users",
        where: {
          phone_number: { equals: phone_number },
        },
      });

      const user = userQuery.docs[0];

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Unknown user",
        });
      }

      if (!user.userEmail) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User email not set",
        });
      }

      return {
        data: {
          email: maskEmail(user.userEmail),
        },
      };
    }),
});
