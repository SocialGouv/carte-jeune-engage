import { type CollectionConfig } from "payload/types";
import type { Props } from "payload/components/views/List";
import dynamic from "next/dynamic";
import { isAdmin } from "../access/isAdmin";

const ExportPermissions = dynamic<Props>(
  () => import("../components/ExportPermissions"),
  {
    ssr: false,
  }
);

export const Permissions: CollectionConfig = {
  slug: "permissions",
  labels: {
    singular: "Autorisation",
    plural: "Autorisations",
  },
  admin: {
    useAsTitle: "phone_number",
    components: {
      BeforeListTable: [ExportPermissions],
    },
  },
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
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
