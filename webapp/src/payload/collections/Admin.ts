import { type CollectionConfig } from "payload";
import { isAdmin } from "../access/isAdmin";

export const Admins: CollectionConfig = {
  slug: "admins",
  labels: {
    singular: "Administrateur",
    plural: "Administrateurs",
  },
  auth: true,
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: "email",
      type: "email",
      label: "Email",
      required: true,
      unique: true,
    },
    {
      name: "firstName",
      type: "text",
      label: "Prénom",
      required: true,
    },
    {
      name: "lastName",
      type: "text",
      label: "Nom",
      required: true,
    },
  ],
};
