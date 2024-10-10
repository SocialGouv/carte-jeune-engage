import { GlobalConfig } from "payload/types";

export const CategoriesList: GlobalConfig = {
  slug: "categories_list",
  label: "[Ordre] Liste des catégories",
  fields: [
    {
      name: "items",
      label: "Catégories",
      labels: {
        singular: "Catégorie",
        plural: "Catégories",
      },
      type: "array",
      fields: [
        {
          name: "category",
          type: "relationship",
          relationTo: "categories",
          label: "Catégorie",
          // filterOptions: (options: any) => ({
          //   id: {
          //     not_in: options.data.items.map((item: any) => item.category),
          //   },
          // }),
          required: true,
        },
      ],
    },
  ],
};
