import { type CollectionConfig } from "payload";
import { isAdmin } from "../access/isAdmin";

export const Tags: CollectionConfig = {
  slug: "tags",
  labels: {
    singular: "Étiquette",
    plural: "Étiquettes",
  },
  admin: {
    useAsTitle: "label",
  },
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
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
      name: "icon",
      type: "upload",
      label: "Icône",
      required: true,
      relationTo: "media",
    },
  ],
};
