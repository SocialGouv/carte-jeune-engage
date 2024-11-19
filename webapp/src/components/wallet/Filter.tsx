import { Center, Box, Text } from "@chakra-ui/react";
import { Dispatch, SetStateAction, ReactNode } from "react";

type WalletFilterProps = {
  label: string;
  slug: string;
  filterSelected: string;
  setFilterSelected: Dispatch<SetStateAction<string>>;
  icon: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
};

const WalletFilter = ({
  label,
  icon,
  filterSelected,
  slug,
  setFilterSelected,
  disabled,
  onClick,
}: WalletFilterProps) => {
  const selected = filterSelected === slug;

  return (
    <Center
      flexDir="column"
      gap={1}
      flex={1}
      onClick={onClick ? onClick : () => !disabled && setFilterSelected(slug)}
    >
      <Box
        bgColor={selected ? "primary" : "bgGray"}
        color={selected ? "white" : "black"}
        px={4}
        py={1.5}
        fontWeight={500}
        borderRadius="2.5xl"
        aria-label="Account"
      >
        {icon}
      </Box>
      <Text
        fontSize={12}
        fontWeight={500}
        textAlign="center"
        color={!disabled ? "black" : "disabled"}
      >
        {label}
      </Text>
    </Center>
  );
};

export default WalletFilter;
