import { type CollectionConfig } from "payload/types";

export const Categories: CollectionConfig = {
  slug: "categories",
  labels: {
    singular: "Catégorie",
    plural: "Catégories",
  },
  admin: {
    useAsTitle: "label",
  },
  fields: [
    {
      name: "slug",
      type: "text",
      label: "Slug",
      required: true,
      unique: true,
    },
    {
      name: "label",
      type: "text",
      label: "Libellé",
      required: true,
    },
    {
      name: "color",
      type: "text",
      label: "Couleur",
    },
    {
      name: "icon",
      type: "upload",
      label: "Icône",
      required: true,
      relationTo: "media",
    },
  ],
};
