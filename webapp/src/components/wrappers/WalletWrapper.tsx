import { Box, Center, Flex, Icon, Text } from "@chakra-ui/react";
import { Dispatch, ReactNode, SetStateAction, useState } from "react";
import { PassIcon } from "../icons/pass";
import { useRouter } from "next/router";
import Image from "../ui/Image";
import {
  HiMiniInformationCircle,
  HiMiniTag,
  HiMiniTicket,
  HiRectangleGroup,
} from "react-icons/hi2";
import { BarcodeIcon } from "../icons/barcode";
import { api } from "~/utils/api";

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
    <Center flexDir="column" gap={1} flex={1}>
      <Box
        bgColor={selected ? "primary" : "bgGray"}
        color={selected ? "white" : "black"}
        px={4}
        py={1.5}
        fontWeight={500}
        borderRadius="2.5xl"
        onClick={onClick ? onClick : () => !disabled && setFilterSelected(slug)}
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

type WalletWrapperProps = {
  children: ReactNode;
  filterSelected: string;
  setFilterSelected: Dispatch<SetStateAction<string>>;
};

const WalletWrapper = ({
  children,
  filterSelected,
  setFilterSelected,
}: WalletWrapperProps) => {
  const router = useRouter();

  const { data: resultTotalAmount } =
    api.saving.getTotalAmountByCurrentUser.useQuery();
  const { data: userTotalAmount } = resultTotalAmount || { data: 0 };

  return (
    <Flex flexDir="column" pt={14} bgColor="bgGray">
      <Center flexDir="column" position="relative">
        <Icon
          as={HiMiniInformationCircle}
          position="absolute"
          top={-1}
          right={10}
          w={5}
          h={5}
          color="disabled"
        />
        <Image src="/images/cje-logo.png" alt="Logo" width={73} height={40} />
        <Text fontSize={14} fontWeight={500} mt={4}>
          Vous avez économisé
        </Text>
        <Text fontSize={36} fontWeight={800} lineHeight="normal" mt={2}>
          {userTotalAmount}€
        </Text>
      </Center>
      <Flex
        flexDir="column"
        h="full"
        bgColor="white"
        borderTopRadius="2.5xl"
        mt={10}
        pt={5}
        shadow="wallet-header"
      >
        <Flex alignItems="center" px={7}>
          <WalletFilter
            label="Tout"
            slug="all"
            icon={<Icon as={HiRectangleGroup} w={6} h={6} mb={-1} />}
            filterSelected={filterSelected}
            setFilterSelected={setFilterSelected}
          />
          <WalletFilter
            label="Mes codes"
            slug="coupons"
            icon={<Icon as={HiMiniTag} w={6} h={6} mb={-1} />}
            filterSelected={filterSelected}
            setFilterSelected={setFilterSelected}
          />
          <WalletFilter
            label="Mes bons"
            slug="orders"
            icon={<BarcodeIcon w={6} h={6} mt={-1.5} />}
            filterSelected={filterSelected}
            setFilterSelected={setFilterSelected}
          />
          <WalletFilter
            label="Mes billets"
            slug="tickets"
            icon={<Icon as={HiMiniTicket} w={6} h={6} mb={-1} opacity={0.2} />}
            filterSelected={filterSelected}
            setFilterSelected={setFilterSelected}
            disabled
          />
          <WalletFilter
            label="Ma carte"
            slug="card"
            icon={<PassIcon w={5} h={5} mt={-1} />}
            filterSelected={filterSelected}
            setFilterSelected={setFilterSelected}
            onClick={() => router.push("/dashboard/account")}
          />
        </Flex>
        <Box flex={1} mt={8} pb={28}>
          {children}
        </Box>
      </Flex>
    </Flex>
  );
};

export default WalletWrapper;
