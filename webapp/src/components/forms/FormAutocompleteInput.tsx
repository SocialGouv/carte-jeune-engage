import {
  Box,
  Button,
  Center,
  Divider,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Spinner,
  Text,
  useOutsideClick,
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
import { Dispatch, SetStateAction, useRef, useState } from "react";

interface Props {
  field: FieldProps;
  options: string[] | undefined;
  setError: any;
  clearErrors: any;
  isLoading: boolean;
  control: Control<any>;
  fieldError: FieldError | undefined;
  handleSubmit: () => Promise<void>;
  setIsInputFocused: Dispatch<SetStateAction<boolean>>;
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
  setIsInputFocused,
}: Props) => {
  const { label, name } = field;
  const [optionsHistory, setOptionsHistory] = useState<string[]>([]);
  const autocompleteRef = useRef<HTMLInputElement | null>(null);

  useOutsideClick({
    ref: autocompleteRef,
    handler: () => setIsInputFocused(false),
  });

  const [currentValue, setCurrentValue] = useState<string | undefined>(
    undefined
  );

  if (currentValue) {
    return (
      <Flex flexDir="column" textAlign="center" gap={20}>
        <Text fontWeight={800} fontSize={24} mt={10}>
          {currentValue}
        </Text>
        <Text
          fontWeight={800}
          textDecoration="underline"
          textDecorationThickness="2px"
          textUnderlineOffset={2}
          onClick={() => setCurrentValue(undefined)}
        >
          Modifier
        </Text>
      </Flex>
    );
  }

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
              ref={autocompleteRef}
              className={
                value && value !== "" ? "chakra-autocomplete-has-value" : ""
              }
              sx={{
                ".chakra-popover__popper": {
                  minWidth: "100% !important",
                },
              }}
            >
              <AutoComplete
                defaultIsOpen
                openOnFocus
                disableFilter
                placement="bottom"
                matchWidth={false}
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
                        {/* <Text
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
                        </Text> */}
                      </Center>
                    );
                  }
                }}
                onSelectOption={({ item }: any) => {
                  clearErrors(name);
                  setOptionsHistory([...optionsHistory, item.value]);
                  onChange(item.value);
                  setCurrentValue(item.value);
                  setIsInputFocused(false);
                }}
              >
                <AutoCompleteInput
                  placeholder={field.placeholder || ""}
                  borderRadius="2xl"
                  border="none"
                  loadingIcon={<></>}
                  errorBorderColor="transparent"
                  autoComplete="off"
                  backgroundColor={
                    !fieldError || fieldError.type === "autocompleteValue"
                      ? "bgGray"
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
                  onFocus={() => setIsInputFocused(true)}
                  value={value}
                  _focusVisible={{
                    borderColor: "transparent",
                    boxShadow: "none",
                  }}
                />
                <AutoCompleteList
                  position="fixed"
                  style={{
                    backgroundColor: "transparent",
                    border: "0",
                    boxShadow: "none",
                    minWidth: "100%",
                  }}
                  loadingState={
                    <Center fontWeight="medium" w="full" py={8}>
                      <Spinner />
                    </Center>
                  }
                  gap={2}
                  mt={-4}
                >
                  {options?.map((option, index) => {
                    const highlightedText = option.slice(0, value.length);
                    const restOfText = option.slice(value.length);
                    return (
                      <>
                        <AutoCompleteItem
                          key={option}
                          value={option}
                          mx={0}
                          _focus={{ bgColor: "transparent" }}
                        >
                          <Text fontWeight={800} fontSize={18}>
                            {highlightedText}
                            <Text as="span" fontWeight={500}>
                              {restOfText}
                            </Text>
                          </Text>
                        </AutoCompleteItem>
                        {index !== options.length - 1 && (
                          <Divider borderColor="cje-gray.500" />
                        )}
                      </>
                    );
                  })}
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
