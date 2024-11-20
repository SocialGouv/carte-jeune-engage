import { type CollectionConfig } from "payload";
import { isAdmin } from "../access/isAdmin";

export const Categories: CollectionConfig = {
  slug: "categories",
  labels: {
    singular: "Catégorie",
    plural: "Catégories",
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
      name: "color",
      type: "text",
      label: "Couleur",
    },
    {
      name: "textWhite",
      type: "checkbox",
      label: "Texte en blanc",
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
