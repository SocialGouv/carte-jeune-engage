import { type CollectionConfig } from "payload/types";

export const Partners: CollectionConfig = {
  slug: "partners",
  labels: {
    singular: "Partenaire",
    plural: "Partenaires",
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
      name: "description",
      type: "textarea",
      label: "Description",
    },
    {
      name: "url",
      type: "text",
      label: "URL",
    },
    {
      name: "color",
      type: "text",
      label: "Couleur",
      required: true,
    },
    {
      name: "icon",
      type: "upload",
      label: "Icône",
      required: true,
      relationTo: "media",
    },
    {
      name: "stared",
      type: "checkbox",
      label: "Mettre en avant",
      admin: {
        position: "sidebar",
      },
    },
  ],
};
