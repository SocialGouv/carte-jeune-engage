import {
  Box,
  Center,
  Divider,
  Flex,
  Heading,
  Icon,
  Modal,
  ModalBody,
  ModalContent,
  Text,
  useDisclosure,
  Link,
} from "@chakra-ui/react";
import { Dispatch, ReactNode, SetStateAction } from "react";
import { PassIcon } from "../icons/pass";
import { useRouter } from "next/router";
import Image from "../ui/Image";
import {
  HiChevronRight,
  HiMiniInformationCircle,
  HiMiniTag,
  HiMiniTicket,
  HiReceiptRefund,
  HiRectangleGroup,
  HiXMark,
} from "react-icons/hi2";
import { BarcodeIcon } from "../icons/barcode";
import { api } from "~/utils/api";
import BackButton from "../ui/BackButton";
import WalletFilter from "../wallet/Filter";
import HelpSection from "../wallet/HelpSection";
import NextLink from "next/link";

const helpItems = [
  {
    title: "Quand ce sont des codes",
    icon: <Icon as={HiMiniTag} w={4} h={4} />,
    iconName: "Code",
    description:
      "Le montant que vous économisez grâce aux codes de réduction ne peut as toujours être calculé et ajouté à votre somme d’économies. Par exemple si le code vous offre -10% sur votre commande, l’application carte “jeune engagé” ne peut savoir combien vous avez dépensé dans votre commande et donc combien représentent les 10% d’économies finales.",
  },
  {
    title: "Quand ce sont des bons d’achat",
    icon: <BarcodeIcon w={4} h={4} />,
    iconName: "Bons d’achat",
    description:
      "Pour les bons d’achat calculons les économies que vous réalisez directement au moment où vous achetez votre bon d’achat. Par exemple si vous achetez un bon d’une valeur de 10€ avec 10% de réduction, l’application carte “jeune engagé” vous affiche 1€ d’économie réalisée.",
  },
  {
    title: "Quand ce sont des billets",
    icon: <Icon as={HiMiniTicket} w={4} h={4} />,
    iconName: "Billets",
    description:
      "Pour les billets nous calculons directement les économies que vous faite grâce à la différence entre le prix public qui est affiché sur l’offre et le prix réel avec la réduction qui vous est proposé sur la carte “jeune engagé”.",
  },
];

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
  const {
    isOpen: isOpenInfoModal,
    onOpen: onOpenInfoModal,
    onClose: onCloseInfoModal,
  } = useDisclosure();

  const { data: resultTotalAmount } =
    api.saving.getTotalAmountByCurrentUser.useQuery();
  const { data: userTotalAmount } = resultTotalAmount || { data: 0 };

  return (
    <>
      <Flex flexDir="column" minH="full" pt={14}>
        <Center flexDir="column" position="relative">
          <Icon
            as={HiMiniInformationCircle}
            position="absolute"
            top={-1}
            right={10}
            w={5}
            h={5}
            color="disabled"
            onClick={onOpenInfoModal}
          />
          <Box position="absolute" top={-3.5} left={8}>
            <WalletFilter
              label="Ma carte"
              slug="card"
              icon={<PassIcon w={5} h={5} mt={-1} />}
              filterSelected={filterSelected}
              setFilterSelected={setFilterSelected}
              onClick={() => router.push("/dashboard/account")}
            />
          </Box>
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
          minH="full"
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
              icon={
                <Icon as={HiMiniTicket} w={6} h={6} mb={-1} opacity={0.2} />
              }
              filterSelected={filterSelected}
              setFilterSelected={setFilterSelected}
              disabled
            />
          </Flex>
          <Box flex={1} mt={8} pb={28}>
            {children}
          </Box>
        </Flex>
      </Flex>
      <Modal isOpen={isOpenInfoModal} onClose={onCloseInfoModal} size="full">
        <ModalContent>
          <ModalBody display="flex" flexDirection="column" mt={10} pb={12}>
            <Box ml={-2}>
              <BackButton
                onClick={onCloseInfoModal}
                variant="ghost"
                icon={HiXMark}
              />
            </Box>
            <Heading size="xl" fontWeight={800} mt={5}>
              Comment sont calculées mes économies ?
            </Heading>
            <Text fontWeight={500} mt={6}>
              Vos économies sont calculées à partir des offres que vous avez
              utilisées.
            </Text>
            <Divider borderColor="cje-gray.100" mt={4} />
            <Link
              as={NextLink}
              href="/dashboard/account/history"
              _hover={{ textDecoration: "none" }}
              passHref
            >
              <Flex alignItems="center" justifyContent="space-between" py={5}>
                <Flex alignItems="center" gap={4}>
                  <Icon
                    as={HiReceiptRefund}
                    w={5}
                    h={5}
                    mt={0.5}
                    color="blackLight"
                  />
                  <Text fontWeight={500}>Historique des réductions</Text>
                </Flex>
                <Icon as={HiChevronRight} w={6} h={6} />
              </Flex>
            </Link>
            <Divider borderColor="cje-gray.100" mb={4} />
            {helpItems.map(({ title, icon, iconName, description }, index) => (
              <>
                <HelpSection
                  key={index}
                  title={`${index + 1}. ${title}`}
                  icon={icon}
                  iconName={iconName}
                  description={description}
                />
                {index !== helpItems.length - 1 && (
                  <Divider borderColor="cje-gray.100" my={4} />
                )}
              </>
            ))}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default WalletWrapper;
