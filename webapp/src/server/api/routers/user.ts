import { TRPCError } from "@trpc/server";
import { Payload } from "payload";
import { generatePasswordSaltHash } from "payload/dist/auth/strategies/local/generatePasswordSaltHash";
import APIError from "payload/dist/errors/APIError";
import { z } from "zod";
import { Media, User } from "~/payload/payload-types";
import {
  createTRPCRouter,
  publicProcedure,
  userProtectedProcedure,
} from "~/server/api/trpc";
import {
  generateRandomPassword,
  payloadOrPhoneNumberCheck,
} from "~/utils/tools";

export interface UserIncluded extends User {
  image: Media;
}

const changeUserPassword = async (
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
  phone_number: string,
  firstLogin: boolean
) => {
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
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Octopush error",
      cause: octopushResponse.message,
    });
  } else if (!!octopushResponse.otp_request_token) {
    if (firstLogin) {
      await payload.create({
        collection: "users",
        data: {
          email: email,
          otp_request_token: octopushResponse.otp_request_token,
          password: generateRandomPassword(16),
          phone_number: phone_number,
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
          .enum(["franceTravail", "missionLocale", "serviceCivique"])
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
        is_desktop: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input: userInput }) => {
      const { phone_number, is_desktop } = userInput;

      const users = await ctx.payload.find({
        collection: "users",
        limit: 1,
        page: 1,
        where: {
          ...payloadOrPhoneNumberCheck(phone_number),
        },
      });

      if (!users.docs.length) {
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
          if (!is_desktop)
            await generateAndSendOTP(ctx.payload, phone_number, true);
          return { data: "ok" };
        }
      } else {
        if (!is_desktop)
          await generateAndSendOTP(ctx.payload, phone_number, false);
        return { data: "ok" };
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
});
