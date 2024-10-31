import { type CollectionConfig } from "payload/types";
import { isAdmin } from "../access/isAdmin";

export const EmailAuthTokens: CollectionConfig = {
  slug: "email_auth_tokens",
  labels: {
    singular: "Token d'authentification par email",
    plural: "Tokens d'authentification par email",
  },
  access: {
    read: isAdmin,
    create: () => false,
    update: () => false,
    delete: isAdmin,
  },
  fields: [
    {
      name: "user",
      type: "relationship",
      relationTo: "users",
      label: "Utilisateur",
      required: true,
    },
    {
      name: "token",
      type: "text",
      label: "Token",
      required: true,
    },
    {
      name: "expiration",
      type: "date",
      label: "Expiration",
      admin: {
        date: {
          pickerAppearance: "dayAndTime",
        },
      },
    },
  ],
};
