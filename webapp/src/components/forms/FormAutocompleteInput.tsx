import {
  Box,
  Button,
  Center,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Spinner,
  Text,
} from "@chakra-ui/react";
import {
  Control,
  Controller,
  FieldError,
  UseFormHandleSubmit,
} from "react-hook-form";
import {
  AutoComplete,
  AutoCompleteInput,
  AutoCompleteItem,
  AutoCompleteList,
} from "@choc-ui/chakra-autocomplete";
import { FieldProps } from "./FormInput";
import { useState } from "react";

interface Props {
  field: FieldProps;
  options: string[] | undefined;
  setError: any;
  clearErrors: any;
  isLoading: boolean;
  control: Control<any>;
  fieldError: FieldError | undefined;
  handleSubmit: () => Promise<void>;
}

const FormAutocompleteInput = ({
  field,
  control,
  fieldError,
  options,
  setError,
  clearErrors,
  isLoading,
  handleSubmit,
}: Props) => {
  const { label, name } = field;
  const [optionsHistory, setOptionsHistory] = useState<string[]>([]);

  return (
    <FormControl isRequired isInvalid={!!fieldError}>
      <FormLabel fontWeight="medium" color="disabled" fontSize={12} mb={1}>
        {label}
      </FormLabel>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value } }) => {
          if (
            value &&
            ((!optionsHistory.length && !options?.includes(value)) ||
              (!!optionsHistory.length && !optionsHistory?.includes(value))) &&
            fieldError === undefined
          ) {
            setError(name, {
              type: "autocompleteValue",
              message: "",
            });
          }

          return (
            <Box
              className={
                value && value !== "" ? "chakra-autocomplete-has-value" : ""
              }
            >
              <AutoComplete
                defaultIsOpen
                openOnFocus
                disableFilter
                placement="bottom"
                isLoading={value && value.length > 2 && isLoading}
                emptyState={(e: any) => {
                  if (e.query.length > 2) {
                    return (
                      <Center
                        display="flex"
                        flexDir="column"
                        bgColor="cje-gray.500"
                        borderRadius="2xl"
                        fontWeight="medium"
                        py={8}
                      >
                        <Text>Pas de résultats</Text>
                        <Text
                          fontWeight="bold"
                          mt={2}
                          borderBottom="1px solid"
                          onClick={() => {
                            clearErrors(name);
                            setOptionsHistory([...optionsHistory, value]);
                            handleSubmit();
                          }}
                        >
                          Valider quand même cette adresse
                        </Text>
                      </Center>
                    );
                  }
                }}
                onSelectOption={({ item }: any) => {
                  clearErrors(name);
                  setOptionsHistory([...optionsHistory, item.value]);
                  onChange(item.value);
                }}
              >
                <AutoCompleteInput
                  placeholder=""
                  borderRadius="2xl"
                  border="none"
                  loadingIcon={<></>}
                  errorBorderColor="transparent"
                  autoComplete="off"
                  backgroundColor={
                    !fieldError || fieldError.type === "autocompleteValue"
                      ? "cje-gray.500"
                      : "errorLight"
                  }
                  px={5}
                  py={8}
                  autoFocus
                  onChange={(e: any) => {
                    onChange(e.target.value);
                    if (!options?.includes(e.target.value)) {
                      setError(name, {
                        type: "autocompleteValue",
                        message: "",
                      });
                    } else {
                      clearErrors(name);
                    }
                  }}
                  value={value}
                  _focusVisible={{
                    borderColor: "transparent",
                    boxShadow: "none",
                  }}
                />
                <AutoCompleteList
                  style={{
                    backgroundColor: "transparent",
                    border: "0",
                    boxShadow: "none",
                  }}
                  loadingState={
                    <Center
                      bgColor="cje-gray.500"
                      borderRadius="2xl"
                      fontWeight="medium"
                      w="full"
                      py={8}
                    >
                      <Spinner />
                    </Center>
                  }
                  gap={2}
                  mt={-4}
                >
                  {options?.map((option) => (
                    <AutoCompleteItem
                      key={option}
                      value={option}
                      mx={0}
                      textTransform="capitalize"
                      bgColor="cje-gray.500"
                      borderRadius="2xl"
                      py={3}
                      px={4}
                      border="2px solid"
                      borderColor={
                        option === value ? "blackLight" : "transparent"
                      }
                      _focus={{
                        borderColor: "blackLight",
                      }}
                    >
                      <Text fontWeight="medium">{option}</Text>
                    </AutoCompleteItem>
                  ))}
                </AutoCompleteList>
              </AutoComplete>
            </Box>
          );
        }}
      />
      <FormErrorMessage>{fieldError?.message}</FormErrorMessage>
    </FormControl>
  );
};

export default FormAutocompleteInput;
