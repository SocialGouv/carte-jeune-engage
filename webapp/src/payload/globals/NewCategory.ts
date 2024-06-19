import { GlobalConfig } from "payload/types";

export const NewCategory: GlobalConfig = {
  slug: "newCategory",
  label: "[Catégorie] Nouveauté",
  fields: [
    {
      name: "label",
      type: "text",
      label: "Libellé",
      defaultValue: "Nouveauté",
      required: true,
    },
    {
      name: "icon",
      type: "upload",
      label: "Icône",
      required: true,
      relationTo: "media",
    },
    {
      name: "items",
      label: "Offres",
      labels: {
        singular: "Offre",
        plural: "Offres",
      },
      type: "array",
      fields: [
        {
          name: "offer",
          type: "relationship",
          relationTo: "offers",
          label: "Offre",
        },
      ],
    },
  ],
};
