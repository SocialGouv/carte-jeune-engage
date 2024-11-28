import { fields } from "@payloadcms/plugin-form-builder";
import { PluginConfig } from "@payloadcms/plugin-form-builder/dist/types";
import { Field } from "payload/types";

const baseFields: Field[] = [
  {
    type: "row",
    fields: [
      {
        type: "text",
        name: "name",
        required: true,
        label: "Nom (miniscule, pas de caractères spéciaux)",
      },
      { type: "text", name: "label", label: "Libellé" },
    ],
  },
  {
    type: "checkbox",
    name: "required",
    label: "Requis",
  },
];

export const formBuilderConfig: PluginConfig = {
  fields: {
    country: {
      labels: {
        singular: "Échelle de valeurs",
        plural: "Échelles de valeurs",
      },
      fields: [
        ...baseFields,
        {
          type: "row",
          fields: [
            { type: "number", name: "min", label: "Minimum", min: 0 },
            { type: "number", name: "max", label: "Maximum", min: 1 },
          ],
        },
        {
          type: "array",
          name: "textLegend",
          label: "Text Legend",
          fields: [{ type: "text", name: "label", label: "Label" }],
        },
      ],
    },
    textarea: {
      labels: {
        singular: "Zone de texte",
        plural: "Zones de texte",
      },
      fields: [
        ...baseFields,
        {
          type: "text",
          name: "placeholder",
          label: "Placeholder",
        },
      ],
    },
    number: false,
    checkbox: false,
    email: false,
    message: false,
    select: false,
    state: false,
    text: false,
  },
};
