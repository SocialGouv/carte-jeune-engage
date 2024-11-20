import { type CollectionConfig } from "payload";
import { isAdmin } from "../access/isAdmin";

export const SearchRequests: CollectionConfig = {
  slug: "search_requests",
  labels: {
    singular: "Demande de recherche",
    plural: "Demandes de recherche",
  },
  admin: {
    useAsTitle: "name",
  },
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: "name",
      type: "text",
      label: "Nom",
      required: true,
      unique: true,
    },
    {
      name: "count",
      type: "number",
      label: "Nombre de demandes",
      defaultValue: 0,
      required: true,
    },
  ],
};
