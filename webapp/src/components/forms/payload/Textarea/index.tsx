import React from "react";
import { TextField } from "@payloadcms/plugin-form-builder/dist/types";
import {
  UseFormRegister,
  FieldValues,
  FieldErrorsImpl,
  FieldError,
} from "react-hook-form";
import FormInput from "../../FormInput";

export const Textarea: React.FC<{
  register: UseFormRegister<FieldValues & any>;
  errors: Partial<
    FieldErrorsImpl<{
      [x: string]: any;
    }>
  >;
  field: TextField;
}> = ({ register, field, errors }) => {
  return (
    <FormInput
      key={field.name}
      register={register}
      field={{ ...field, kind: field.blockType as any }}
      fieldError={errors[field.name] as FieldError}
    />
  );
};
