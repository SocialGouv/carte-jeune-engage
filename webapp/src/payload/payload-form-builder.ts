import { PluginConfig } from "@payloadcms/plugin-form-builder/dist/types";
import { fields } from "@payloadcms/plugin-form-builder";

export const FormBuilderConfig: PluginConfig = {
  fields: {
    textarea: true,
    number: {
      fields: [
        ...(fields.number as any).fields,
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
      // fields: {
      //   // ...(fields.number.fields as any),
      //   // min: {
      //   //   label: "Minimum",
      //   //   type: "number",
      //   // },
      // },
    },
    checkbox: false,
    country: false,
    email: false,
    message: false,
    select: false,
    state: false,
    text: false,
  },
};
