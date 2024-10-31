import { Box, type ChakraProps, Checkbox, Flex, Text } from "@chakra-ui/react";
import Image, { ImageProps } from "next/image";
import { FieldMetadata } from "~/utils/form/formHelpers";

type Props = {
  children: React.ReactNode;
  kind: "checkbox" | "radio";
  variant?: FieldMetadata["variant"];
  withCheckbox?: boolean;
  value: string;
  currentValue: string | (string | undefined)[];
  iconSrc?: string;
  onChange: (value: string | undefined) => void;
  wrapperProps?: ChakraProps;
};

const FormBlock = ({
  children,
  kind,
  variant = "default",
  withCheckbox,
  value,
  currentValue,
  onChange,
  iconSrc,
  wrapperProps,
}: Props) => {
  const isSelected =
    typeof currentValue === "string"
      ? currentValue === value
      : currentValue?.includes(value);

  return (
    <Flex alignItems="center" w="full" gap={6}>
      <Flex
        flex={1}
        flexDir={variant === "default" ? "column" : "row"}
        w="full"
        borderRadius="2xl"
        px={variant === "default" ? 4 : 2}
        minH={16}
        fontWeight="medium"
        justifyContent={variant === "default" ? "center" : "start"}
        alignItems="center"
        onClick={() => {
          typeof currentValue !== "string" && isSelected
            ? onChange(undefined)
            : onChange(value);
        }}
        borderWidth={variant === "default" ? 2 : 0}
        backgroundColor={
          isSelected && variant === "inline" ? "primary" : "cje-gray.500"
        }
        color={isSelected && variant === "inline" ? "white" : "black"}
        borderColor={isSelected ? "blackLight" : "transparent"}
        cursor="pointer"
        gap={variant === "default" ? 2 : 4}
        {...wrapperProps}
      >
        {iconSrc && (
          <Box
            p={1}
            bgColor={kind === "radio" && isSelected ? "white" : "transparent"}
            borderRadius="2lg"
          >
            <Image
              src={iconSrc}
              alt=""
              width={kind === "radio" ? 80 : 65}
              height={kind === "radio" ? 40 : 65}
            />
          </Box>
        )}
        <Text
          fontWeight={isSelected ? "extrabold" : "medium"}
          textAlign={variant === "default" ? "center" : "start"}
        >
          {children}
        </Text>
      </Flex>
      {withCheckbox && (
        <Checkbox
          isChecked={isSelected}
          onChange={(e) => {
            e.stopPropagation();
            onChange(e.target.checked ? value : undefined);
          }}
          variant="circular"
          borderRadius="full"
          colorScheme="primaryShades"
          size="lg"
        />
      )}
    </Flex>
  );
};

export default FormBlock;
