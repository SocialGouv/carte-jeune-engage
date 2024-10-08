import { Flex, Icon, Text } from "@chakra-ui/react";
import { HiClock, HiOutlineClock } from "react-icons/hi2";

type ExpiryTagsProps = {
  expiryDate: string;
  variant?: "default" | "minimal";
  expiryTextMode?: "verbose" | "short";
};

export function getExpiryObject(
  expiryDate: string,
  expiryTextMode: "verbose" | "short" = "verbose"
): {
  differenceInDays: number;
  expiryText: string;
} {
  const expiryDateObj = new Date(expiryDate);
  const isYearEnd =
    expiryDateObj.getMonth() === 11 && expiryDateObj.getDate() === 31;

  if (isYearEnd) {
    return {
      differenceInDays: 365,
      expiryText: "Toute l'année",
    };
  }

  const differenceInDays = Math.floor(
    (expiryDateObj.setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) /
      (1000 * 3600 * 24)
  );

  return {
    expiryText:
      differenceInDays > 0
        ? expiryTextMode === "verbose"
          ? `Fin dans ${differenceInDays} jour${differenceInDays > 1 ? "s" : ""}`
          : `${differenceInDays} j`
        : "Offre expirée",
    differenceInDays,
  };
}

const ExpiryTag = ({
  expiryDate,
  variant = "default",
  expiryTextMode = "verbose",
}: ExpiryTagsProps) => {
  const { expiryText, differenceInDays } = getExpiryObject(
    expiryDate,
    expiryTextMode
  );

  return (
    <Flex
      alignSelf="center"
      align="center"
      borderRadius="2xl"
      color={
        variant === "default" && differenceInDays <= 10 ? "white" : "black"
      }
      bgColor={
        variant === "default"
          ? differenceInDays <= 10
            ? "error"
            : "bgGray"
          : "inherit"
      }
      py={0.5}
      px={2}
    >
      <Icon
        as={variant === "default" ? HiClock : HiOutlineClock}
        w={4}
        h={4}
        mr={1}
      />
      <Text
        fontSize={variant === "default" ? 12 : 14}
        fontWeight={700}
        mb={0.5}
      >
        {expiryText}
      </Text>
    </Flex>
  );
};

export default ExpiryTag;
