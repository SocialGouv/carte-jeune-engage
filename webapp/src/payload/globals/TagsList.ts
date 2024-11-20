import { GlobalConfig } from "payload";

export const TagsList: GlobalConfig = {
  slug: "tags_list",
  label: "[Ordre] Liste des étiquettes",
  fields: [
    {
      name: "items",
      label: "Étiquettes",
      labels: {
        singular: "Étiquette",
        plural: "Étiquettes",
      },
      type: "array",
      fields: [
        {
          name: "tag",
          type: "relationship",
          relationTo: "tags",
          label: "Étiquette",
          // filterOptions: (options: any) => ({
          //   id: {
          //     not_in: options.data.items.map((item: any) => item.tag),
          //   },
          // }),
          required: true,
        },
      ],
    },
  ],
};
