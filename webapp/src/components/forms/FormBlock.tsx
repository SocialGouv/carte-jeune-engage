import { Box, type ChakraProps, Checkbox, Flex, Text } from "@chakra-ui/react";
import Image, { ImageProps } from "next/image";

type Props = {
  children: React.ReactNode;
  variant?: "default" | "inline";
  withCheckbox?: boolean;
  value: string;
  currentValue: string | string[];
  iconSrc?: string;
  onChange: (value: string | undefined) => void;
  wrapperProps?: ChakraProps;
  iconProps?: Partial<ImageProps>;
  wrapperIconProps?: ChakraProps;
};

const FormBlock = ({
  children,
  variant = "default",
  withCheckbox,
  value,
  currentValue,
  onChange,
  iconSrc,
  wrapperProps,
  iconProps,
  wrapperIconProps,
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
          <Box p={1} {...wrapperIconProps}>
            <Image src={iconSrc} alt="" width={65} height={65} {...iconProps} />
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
