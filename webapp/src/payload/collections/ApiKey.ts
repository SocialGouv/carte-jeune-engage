import { type CollectionConfig } from "payload";
import { isAdmin } from "../access/isAdmin";

export const ApiKeys: CollectionConfig = {
  slug: "apikeys",
  labels: {
    singular: "Clé API",
    plural: "Clés API",
  },
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: "key",
      type: "text",
      label: "Clé API",
      required: true,
      unique: true,
      minLength: 32,
      maxLength: 32,
    },
  ],
};
