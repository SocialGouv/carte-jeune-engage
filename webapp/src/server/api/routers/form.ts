import { createTRPCRouter, userProtectedProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const formRouter = createTRPCRouter({
  getFormBySlug: userProtectedProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const { slug } = input;

      const forms = await ctx.payload.find({
        collection: "forms",
        where: {
          title: {
            equals: slug,
          },
        },
        depth: 3,
        page: 1,
        limit: 1,
      });

      if (!forms.docs.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Form not found",
        });
      }

      const form = forms.docs[0];

      return {
        data: form,
      };
    }),

  submitForm: userProtectedProcedure
    .input(
      z.object({
        formId: z.number(),
        submissionData: z.array(
          z.object({
            field: z.string(),
            value: z.string(),
          })
        ),
        offer_id: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { formId, submissionData, offer_id } = input;

      const submission = await ctx.payload.create({
        collection: "form-submissions",
        data: {
          form: formId,
          submissionData: submissionData,
          offer: offer_id,
        },
      });

      return {
        data: submission,
      };
    }),
});
