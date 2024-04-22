import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { Supervisor } from "~/payload/payload-types";
import {
  createTRPCRouter,
  supervisorProtectedProcedure,
} from "~/server/api/trpc";

export const permissionRouter = createTRPCRouter({
  create: supervisorProtectedProcedure
    .input(
      z.object({
        phone_number: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { phone_number } = input;
      const hasDialingCode = phone_number.startsWith("+");

      const existing = await ctx.payload.find({
        collection: "permissions",
        where: {
          phone_number: { equals: phone_number },
        },
        page: 1,
        limit: 1,
      });

      if (!!existing.docs.length) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Phone already whitelisted",
          cause: "Existing phone number",
        });
      }

      try {
        const currentSupervisor = await ctx.payload.findByID({
          collection: "supervisors",
          id: ctx.session.id,
        });

        const permission = await ctx.payload.create({
          collection: "permissions",
          data: {
            phone_number,
            createdBy: currentSupervisor.id,
            supervisorKind: currentSupervisor.kind,
          },
        });

        const smsText = (supervisorKind: Supervisor["kind"]) => {
          if (supervisorKind === "SC") {
            return `Le Service civique vous donne accès à l’appli carte « jeune engagé »!`;
          } else if (supervisorKind === "ML") {
            return `Votre conseiller Mission locale vous donne accès à l’appli carte « jeune engagé »!`;
          } else if (supervisorKind === "FT") {
            return `Votre conseiller France travail vous donne accès à l’appli carte « jeune engagé »!`;
          } else {
            return `Vos réductions carte « jeune engagé » vous attendent !`;
          }
        };

        await fetch("https://api.octopush.com/v1/public/sms-campaign/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "api-login": process.env.OCTOPUSH_API_LOGIN as string,
            "api-key": process.env.OCTOPUSH_API_KEY as string,
            "cache-control": "no-cache",
          },
          body: JSON.stringify({
            recipients: [
              {
                phone_number: hasDialingCode
                  ? phone_number
                  : `+33${phone_number.substring(1)}`,
              },
            ],
            // prettier-ignore
            text: `${smsText(currentSupervisor.kind)} Téléchargez l'application ici : https://cje.fabrique.social.gouv.fr/. STOP au 30101`,
          }),
        })
          .then((response) => response.json())
          .then((data) => data);

        return {
          data: permission,
        };
      } catch (error: any) {
        const firstError = error?.data[0];
        if (firstError) {
          if (
            firstError.field === "phone" &&
            firstError.message?.includes("must be unique")
          ) {
            throw new TRPCError({
              code: "CONFLICT",
              message: "Phone already whitelisted",
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
});
