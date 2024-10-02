import { Box, type ChakraProps, Flex, Text } from "@chakra-ui/react";
import Image, { ImageProps } from "next/image";

type Props = {
  children: React.ReactNode;
  variant?: "default" | "inline";
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
  value,
  currentValue,
  onChange,
  iconSrc,
  wrapperProps,
  iconProps,
  wrapperIconProps,
}: Props) => {
  console.log(currentValue);
  const isSelected =
    typeof currentValue === "string"
      ? currentValue === value
      : currentValue?.includes(value);

  return (
    <Flex
      flex={1}
      flexDir={variant === "default" ? "column" : "row"}
      w="full"
      borderRadius="2xl"
      px={4}
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
        fontWeight={isSelected ? "bold" : "medium"}
        textAlign={variant === "default" ? "center" : "start"}
        noOfLines={1}
      >
        {children}
      </Text>
    </Flex>
  );
};

export default FormBlock;
