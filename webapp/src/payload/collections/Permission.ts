import { type CollectionConfig } from "payload/types";

export const Permissions: CollectionConfig = {
  slug: "permissions",
  labels: {
    singular: "Autorisation",
    plural: "Autorisations",
  },
  admin: {
    useAsTitle: "phone_number",
  },
  fields: [
    {
      name: "phone_number",
      type: "text",
      required: true,
      unique: true,
      label: "Téléphone",
    },
    {
      name: "createdBy",
      type: "relationship",
      relationTo: "supervisors",
      label: "Créé par",
    },
    {
      name: "supervisorKind",
      type: "select",
      label: "Type de référent",
      options: [
        { label: "Mission locale", value: "ML" },
        { label: "Service civique", value: "SC" },
        { label: "France travail", value: "FT" },
      ],
    },
  ],
};
