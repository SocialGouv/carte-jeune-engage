import React from "react";
import { TextField } from "@payloadcms/plugin-form-builder/dist/types";
import {
  UseFormRegister,
  FieldValues,
  FieldErrorsImpl,
  Controller,
} from "react-hook-form";
import {
  Flex,
  FormControl,
  FormLabel,
  IconButton,
  Text,
} from "@chakra-ui/react";

export const Ladder: React.FC<{
  register: UseFormRegister<FieldValues & any>;
  control: any;
  errors: Partial<
    FieldErrorsImpl<{
      [x: string]: any;
    }>
  >;
  field: TextField & {
    min: number;
    max: number;
    textLegend: { label: string }[];
  };
}> = ({ field: currentField, control }) => {
  console.log("currentField", currentField);

  const ladderArr = Array.from(
    { length: currentField.max - currentField.min + 1 },
    (_, index) => (index + currentField.min).toString()
  );

  return (
    <FormControl>
      <FormLabel
        fontSize={24}
        fontWeight={800}
        lineHeight="normal"
        textAlign="center"
      >
        {currentField.label}
      </FormLabel>
      <Controller
        control={control}
        name={currentField.name}
        render={({ field }) => {
          return (
            <Flex flexDir="column" gap={2} alignItems="center">
              <Flex alignItems="center" gap={0.5} w="full">
                {ladderArr.map((item) => (
                  <IconButton
                    flex={1}
                    key={item}
                    aria-label="Test"
                    icon={<>{item}</>}
                    h={10}
                    borderRadius="base"
                    fontSize={16}
                    fontWeight={800}
                    minWidth="auto"
                    color={field.value === item ? "white" : "black"}
                    colorScheme={
                      field.value === item ? "primaryShades" : "bgGrayShades"
                    }
                    onClick={() => field.onChange(item)}
                  />
                ))}
              </Flex>
              <Flex w="full" alignItems="center" justifyContent="space-between">
                {currentField.textLegend.map((item) => (
                  <Text fontSize={14} fontWeight={500}>
                    {item.label}
                  </Text>
                ))}
              </Flex>
            </Flex>
          );
        }}
      />
    </FormControl>
  );
};
