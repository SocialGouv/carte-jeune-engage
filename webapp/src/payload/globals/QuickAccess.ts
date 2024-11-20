import { GlobalConfig } from "payload";

export const QuickAccess: GlobalConfig = {
  slug: "quickAccess",
  label: "Accès rapides",
  fields: [
    {
      name: "items",
      label: "Accès rapides",
      labels: {
        singular: "Accès rapide",
        plural: "Accès rapides",
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
        {
          name: "offer",
          type: "relationship",
          filterOptions: (options: any) => ({
            partner: {
              equals: options.siblingData.partner,
            },
          }),
          admin: {
            condition: (_, siblingData: any) => {
              return !!siblingData.partner;
            },
          },
          required: true,
          relationTo: "offers",
          label: "Offre",
        },
      ],
    },
  ],
};
