import { type CollectionConfig } from "payload";
import { isAdmin, isAdminOrSelf } from "../access/isAdmin";

export const Supervisors: CollectionConfig = {
  slug: "supervisors",
  auth: true,
  labels: {
    singular: "Référent",
    plural: "Référents",
  },
  admin: {
    useAsTitle: "email",
  },
  access: {
    read: isAdminOrSelf,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: "email",
      type: "email",
      unique: true,
      label: "Email",
    },
    {
      name: "cgu",
      type: "checkbox",
      label: "CGU Acceptées",
      admin: {
        description:
          "Cette case est cochée si le référent a accepté les CGU (première connexion)",
      },
      defaultValue: false,
    },
    {
      name: "kind",
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
