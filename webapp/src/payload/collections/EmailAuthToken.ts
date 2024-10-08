import { type CollectionConfig } from "payload/types";

export const EmailAuthTokens: CollectionConfig = {
  slug: "email_auth_tokens",
  labels: {
    singular: "Token d'authentification par email",
    plural: "Tokens d'authentification par email",
  },
  access: {
    create: () => false,
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
      defaultValue: () => Date.now() + 3600000,
    },
  ],
};
