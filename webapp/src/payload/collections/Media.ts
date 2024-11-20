import { type CollectionConfig } from "payload";

export const Media: CollectionConfig = {
  slug: "media",
  labels: {
    singular: "Image",
    plural: "Images",
  },
  upload: {
    mimeTypes: ["image/*", "application/pdf"],
    disableLocalStorage: true,
  },
  fields: [
    {
      name: "alt",
      type: "text",
    },
  ],
};
