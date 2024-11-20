import { GlobalConfig } from "payload";

export const LandingFAQ: GlobalConfig = {
  slug: "landingFAQ",
  label: "[Accueil] Foire aux questions",
  fields: [
    {
      name: "items",
      label: "Questions",
      labels: {
        singular: "Question",
        plural: "Questions",
      },
      type: "array",
      fields: [
        {
          name: "title",
          type: "text",
          label: "Titre",
          required: true,
        },
        {
          name: "content",
          type: "textarea",
          label: "Contenu",
          required: true,
        },
      ],
    },
  ],
};
