import { type CollectionConfig } from "payload";
import { isAdmin } from "../access/isAdmin";

export const Notifications: CollectionConfig = {
  slug: "notifications",
  labels: {
    singular: "Notification",
    plural: "Notifications",
  },
  access: {
    read: isAdmin,
    create: () => false,
    update: () => false,
    delete: isAdmin,
  },
  fields: [
    {
      name: "slug",
      type: "text",
      label: "Slug",
      required: true,
    },
    {
      name: "user",
      type: "relationship",
      label: "Utilisateur",
      relationTo: "users",
    },
    {
      name: "title",
      type: "text",
      label: "Titre",
      required: true,
    },
    {
      name: "offer",
      type: "relationship",
      label: "Offre",
      relationTo: "offers",
      hasMany: false,
    },
    {
      name: "message",
      type: "text",
      label: "Message",
    },
    {
      name: "error",
      type: "json",
      label: "Erreur",
    },
    {
      name: "appVersion",
      type: "text",
      label: "Version de l'application",
    },
  ],
};
