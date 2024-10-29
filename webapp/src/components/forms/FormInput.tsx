import {
  ChakraProps,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  InputProps,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { HTMLInputTypeAttribute } from "react";
import {
  FieldError,
  UseFormRegister,
  ValidationValueMessage,
} from "react-hook-form";

export type FieldProps = {
  label?: string;
  name: string;
  kind: HTMLInputTypeAttribute | "block";
  placeholder?: string;
  description?: string;
  autocomplete?: string;
  prefix?: string;
  values?: { value: string; label: string }[];
  rules?: {
    [key: string]:
      | string
      | number
      | ((value: string | number) => boolean | string)
      | ValidationValueMessage;
  };
};

interface Props {
  field: FieldProps;
  register: UseFormRegister<any>;
  fieldError?: FieldError | undefined;
  wrapperProps?: ChakraProps;
  inputProps?: InputProps;
}

const FormInput = ({
  field: {
    name,
    kind,
    rules,
    label,
    placeholder,
    description,
    prefix,
    autocomplete,
  },
  register,
  fieldError,
  wrapperProps,
  inputProps,
}: Props) => {
  const { autoFocus = true, ...restInputProps } = inputProps || {};

  return (
    <FormControl
      isRequired={
        inputProps?.isRequired === undefined ? true : inputProps?.isRequired
      }
      isInvalid={!!fieldError}
      {...wrapperProps}
      _before={
        prefix
          ? {
              content: `"${prefix}"`,
              position: "absolute",
              top: "2.65rem",
              left: "1rem",
              width: "1rem",
              height: "1rem",
              zIndex: 99,
            }
          : {}
      }
    >
      <FormLabel fontWeight="medium" color="disabled" fontSize={12} mb={1}>
        {label}
      </FormLabel>
      <Input
        id={name}
        as={kind === "textarea" ? Textarea : Input}
        {...restInputProps}
        autoFocus={autoFocus}
        type={kind}
        placeholder={placeholder}
        borderRadius={16}
        border="none"
        errorBorderColor="transparent"
        autoComplete={autocomplete || "off"}
        backgroundColor={!fieldError ? "bgGray" : "errorLight"}
        pr={5}
        pl={prefix ? 12 : 5}
        py={8}
        _focusVisible={{
          borderColor: "transparent",
          boxShadow: "none",
        }}
        {...register(name, { ...rules })}
        position={"relative"}
      />
      {description && (
        <Text color="disabled" fontSize={12} mt={1} fontWeight={500}>
          {description}
        </Text>
      )}
      <FormErrorMessage>{fieldError?.message}</FormErrorMessage>
    </FormControl>
  );
};

export default FormInput;
