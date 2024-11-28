import { GlobalConfig } from "payload";

export const LandingPartners: GlobalConfig = {
  slug: "landingPartners",
  label: "[Accueil] Logos des partenaires",
  fields: [
    {
      name: "items",
      label: "Partenaires",
      labels: {
        singular: "Partenaire",
        plural: "Partenaires",
      },
      type: "array",
      fields: [
        {
          name: "partner",
          type: "relationship",
          relationTo: "partners",
          label: "Partenaire",
          required: true,
        },
      ],
    },
  ],
};
