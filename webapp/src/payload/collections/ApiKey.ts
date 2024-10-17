import { type CollectionConfig } from "payload/types";

export const ApiKeys: CollectionConfig = {
  slug: "apikeys",
  labels: {
    singular: "Clé API",
    plural: "Clés API",
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
