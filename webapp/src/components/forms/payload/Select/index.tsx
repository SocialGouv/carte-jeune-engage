import React from "react";
import { TextField } from "@payloadcms/plugin-form-builder/dist/types";
import {
  UseFormRegister,
  FieldValues,
  FieldErrorsImpl,
  Controller,
} from "react-hook-form";
import { Center, Flex, FormControl, Text } from "@chakra-ui/react";
import ReactIcon from "~/utils/dynamicIcon";

export const Select: React.FC<{
  register: UseFormRegister<FieldValues & any>;
  control: any;
  errors: Partial<
    FieldErrorsImpl<{
      [x: string]: any;
    }>
  >;
  field: TextField & {
    options: { id: string; label: string; value: string; icon: string }[];
  };
}> = ({ field: currentField, control }) => {
  const options = currentField.options;

  return (
    <FormControl>
      <Controller
        control={control}
        name={currentField.name}
        render={({ field: { onChange, value } }) => {
          return (
            <Center gap={5} alignItems="center">
              {options.map((item) => (
                <Flex
                  key={item.id}
                  flexDir="column"
                  gap={0.5}
                  onClick={() => onChange(item.value)}
                >
                  <Center
                    p={5.5}
                    alignSelf="center"
                    borderRadius="2.5xl"
                    bgColor={value === item.value ? "primary" : "bgGray"}
                  >
                    <ReactIcon
                      icon={item.icon}
                      color={value === item.value ? "white" : "black"}
                      size={24}
                    />
                  </Center>
                  <Text fontSize={14} fontWeight={800} textAlign="center">
                    {item.label}
                  </Text>
                </Flex>
              ))}
            </Center>
          );
        }}
      />
    </FormControl>
  );
};
