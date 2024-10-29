import { Flex, Text } from "@chakra-ui/react";
import { Dispatch, SetStateAction } from "react";
import {
  Controller,
  FieldError,
  FieldValues,
  Path,
  useFormContext,
} from "react-hook-form";
import useDebounceValueWithState from "~/hooks/useDebounceCallbackWithPending";
import { FieldMetadata } from "~/utils/form/formHelpers";
import FormAutocompleteInput from "./FormAutocompleteInput";
import FormBlock from "./FormBlock";
import FormInput from "./FormInput";
import { useQuery } from "@tanstack/react-query";

const FormField = <TFormData extends FieldValues>({
  field,
  setIsAutocompleteInputFocused,
}: {
  field: FieldMetadata & { name: Path<TFormData>; path: string[] };
  setIsAutocompleteInputFocused?: Dispatch<SetStateAction<boolean>>;
}) => {
  const {
    control,
    register,
    setError,
    clearErrors,
    formState: { errors },
    watch,
  } = useFormContext<TFormData>();
  const error = errors[field.name];
  const value = watch(field.name);

  switch (field.kind) {
    case "text":
    case "email":
    case "date":
      return (
        <FormInput
          key={field.name}
          register={register}
          field={field}
          fieldError={error as FieldError}
          inputProps={{ autoFocus: field.autoFocus }}
        />
      );
    case "radio":
      return (
        <>
          <Controller
            control={control}
            name={field.name}
            render={({ field: { onChange, value } }) => (
              <Flex
                gap={4}
                flexDir={field.variant == "inline" ? "column" : "row"}
              >
                {field.options?.map((option) => (
                  <FormBlock
                    key={`${field.name}-${option.value}`}
                    value={option.value}
                    kind="radio"
                    currentValue={value}
                    variant={field.variant}
                    iconSrc={option.iconSrc}
                    onChange={onChange}
                  >
                    {option.label}
                  </FormBlock>
                ))}
              </Flex>
            )}
          />
          {error && (
            <Text color="red" fontSize="sm" mt={2}>
              {error.message as string}
            </Text>
          )}
        </>
      );
    case "checkbox":
      return (
        <Flex flexDir="column" alignItems="center" w="full" gap={2} pb={32}>
          {field.options?.map((option, index) => (
            <Controller
              key={option.value}
              control={control}
              name={`preferences.${index}` as Path<TFormData>}
              render={({ field: { onChange } }) => (
                <FormBlock
                  value={option.value}
                  currentValue={value}
                  kind="checkbox"
                  variant={field.variant}
                  iconSrc={option.iconSrc}
                  onChange={onChange}
                  withCheckbox
                >
                  {option.label}
                </FormBlock>
              )}
            />
          ))}
        </Flex>
      );
    case "autocomplete":
      if (!setIsAutocompleteInputFocused) return null;

      const [debouncedAddress, isDebouncePending] = useDebounceValueWithState(
        value as string,
        500
      );

      const { data: addressOptions, isLoading: isLoadingAddressOptions } =
        useQuery(
          ["getAddressOptions", debouncedAddress],
          async () => {
            const formatedDebouncedAddress = debouncedAddress.split(",")[0];
            const response = await fetch(
              `https://geo.api.gouv.fr/communes?nom=${formatedDebouncedAddress}&codeDepartement=95&fields=departement&limit=5`
            );
            const data = await response.json();
            return data.map(
              (municipality: any) =>
                `${municipality.nom}, ${municipality.departement.nom}`
            ) as string[];
          },
          {
            enabled: !!debouncedAddress && debouncedAddress.length > 2,
          }
        );

      return (
        <FormAutocompleteInput
          control={control}
          options={addressOptions}
          setError={setError}
          clearErrors={clearErrors}
          isLoading={isLoadingAddressOptions || isDebouncePending}
          field={field}
          fieldError={error as FieldError}
          setIsInputFocused={setIsAutocompleteInputFocused}
        />
      );
    default:
      return null;
  }
};

export default FormField;
