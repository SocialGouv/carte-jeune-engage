// types.ts
import { z } from "zod";

// Field metadata types
export type FieldMetadata = {
  label?: string;
  kind:
    | "text"
    | "number"
    | "email"
    | "date"
    | "radio"
    | "checkbox"
    | "autocomplete";
  description?: string;
  placeholder?: string;
  autocomplete?: string;
  autoFocus?: boolean;
  inputView?: boolean;
  options?: { label: string; value: string; iconSrc?: string }[];
  variant?: "default" | "inline";
  step?: number; // Which form step this field belongs to
  stepTitle?: string; // Title for the step
  stepDescription?: string; // Description for the step
  stepImageSrc?: string; // Image for the step
};

export type FormStep = {
  title: string;
  description: string;
  imageSrc: string;
  fields: (FieldMetadata & {
    name: string;
    path: string[];
  })[];
};

// Helper function to extract field metadata from schema
const extractFieldMetadata = (schema: z.ZodObject<any>) => {
  const fields: Record<string, FieldMetadata & { path: string[] }> = {};

  const traverse = (obj: any, path: string[] = []) => {
    if (obj.meta) {
      fields[path.join(".")] = { ...obj.meta, path };
      return;
    }

    if (obj.shape) {
      Object.entries(obj.shape).forEach(([key, value]: [string, any]) => {
        traverse(value, [...path, key]);
      });
    }
  };

  traverse(schema);
  return fields;
};

// Generate steps configuration from schema
export const generateSteps = (schema: z.ZodObject<any>): FormStep[] => {
  const fields = extractFieldMetadata(schema);
  const steps = Object.entries(fields).reduce(
    (acc, [path, field]) => {
      const step = field.step ?? 1;
      if (!acc[step]) {
        acc[step] = {
          fields: [],
          title: field.stepTitle || `Step ${step}`,
          description: field.stepDescription || "",
          imageSrc: field.stepImageSrc || "",
        };
      }
      acc[step].fields.push({
        ...field,
        name: path,
      });
      return acc;
    },
    {} as Record<
      number,
      {
        fields: (FieldMetadata & { name: string; path: string[] })[];
        title: string;
        description: string;
        imageSrc: string;
      }
    >
  );

  return Object.entries(steps)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([_, stepConfig]) => ({
      title: stepConfig.title,
      description: stepConfig.description,
      imageSrc: stepConfig.imageSrc,
      fields: stepConfig.fields,
    }));
};
