import { type CollectionConfig } from "payload/types";

export const SearchRequests: CollectionConfig = {
  slug: "search_requests",
  labels: {
    singular: "Demande de recherche",
    plural: "Demandes de recherche",
  },
  admin: {
    useAsTitle: "name",
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
