import {
  Box,
  Center,
  ChakraProps,
  Flex,
  Icon,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import Image from "next/image";
import { dottedPattern } from "~/utils/chakra-theme";
import { CouponIncluded } from "~/server/api/routers/coupon";
import ToastComponent from "../ToastComponent";
import { IoCloseCircleOutline } from "react-icons/io5";
import Barcode from "react-barcode";
import { Offer } from "~/payload/payload-types";
import { PiArrowUpRightBold } from "react-icons/pi";
import { push } from "@socialgouv/matomo-next";
import _ from "lodash";
import ExpiryTag from "../offer/ExpiryTag";
import ConditionalLink from "../ConditionalLink";
import { IconType } from "react-icons/lib";
import { HiMiniArrowDown, HiMiniArrowsPointingOut } from "react-icons/hi2";
import PassCard from "../account/PassCard";
import { useMemo } from "react";
import { useAuth } from "~/providers/Auth";

const BasicExternalCard = ({
  title,
  titleProps,
  text,
  onClick,
  icon,
}: {
  title: string;
  titleProps?: ChakraProps;
  text: string;
  onClick: () => void;
  icon: IconType;
}) => {
  return (
    <Flex
      flexDir="column"
      alignItems="start"
      gap={2}
      bg="blackLight"
      color="white"
      borderRadius="2.5xl"
      textAlign="start"
      p={5}
      onClick={onClick}
    >
      <Text fontWeight={500} fontSize={12} mt={1}>
        {text}
      </Text>
      <Flex alignItems="center" justifyContent="space-between" w="full" gap={1}>
        <Text fontWeight={800} fontSize={20} {...titleProps}>
          {title}
        </Text>
        <Icon as={icon} w={6} h={6} mt={1} />
      </Flex>
    </Flex>
  );
};

const CouponCodeCard = ({
  coupon,
  mode,
  offerKind,
  barCodeFormat,
  handleOpenCardModal,
}: {
  coupon: CouponIncluded;
  mode: "default" | "wallet";
  offerKind: Offer["kind"];
  barCodeFormat: Offer["barcodeFormat"];
  handleOpenCardModal: () => void;
}) => {
  const { user } = useAuth();

  const passCJEStatus = useMemo(() => {
    return user?.status_image === "pending" && user.image
      ? "pending"
      : !user?.image
        ? "missing"
        : undefined;
  }, [user]);

  switch (offerKind) {
    case "code":
    case "code_space":
      return (
        <Text
          py={4}
          fontSize={offerKind === "code" ? 24 : 16}
          fontWeight={800}
          letterSpacing={2}
          color={offerKind === "code" ? "black" : "disabled"}
          filter={mode === "default" ? "none" : "blur(5px)"}
        >
          {offerKind === "code"
            ? coupon.code
            : "Le code est déjà appliqué sur le site 😉"}
        </Text>
      );
    case "voucher":
    case mode === "wallet" && "voucher_pass":
      return (
        <Flex flexDir="column">
          <Flex
            w="auto"
            bgColor="white"
            borderRadius="2lg"
            p={2}
            filter={mode === "default" ? "none" : "blur(5px)"}
          >
            <Barcode
              value={coupon.code}
              background="white"
              format={
                barCodeFormat === "upc" ? "UPC" : (barCodeFormat ?? "CODE128")
              }
              height={70}
            />
          </Flex>
          {mode === "default" && (
            <Flex
              position="relative"
              justifyContent="space-between"
              alignItems="center"
              w="full"
              mt={2}
              fontWeight={500}
              fontSize={12}
              color="blackLight"
            >
              <Text textAlign="start">
                {_.capitalize(coupon.user.firstName as string)}
                <br />
                {_.capitalize(coupon.user.lastName as string)}
              </Text>
              <Image
                src="/images/cje-logo.png"
                alt="Logo CJE"
                width={40}
                height={20}
                style={{
                  position: "absolute",
                  right: "50%",
                  transform: "translateX(50%)",
                }}
              />
              <Text textAlign="end">
                {new Date().toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
                <br />
                {new Date().toLocaleTimeString("fr-FR")}
              </Text>
            </Flex>
          )}
        </Flex>
      );
    case "voucher_pass":
      const passCJEColor =
        passCJEStatus === "missing"
          ? "error"
          : passCJEStatus === "pending"
            ? "primary"
            : "success";
      return (
        <Flex flexDir="column" gap={2.5}>
          <BasicExternalCard
            title="Présenter ma carte “jeune engagé”"
            text="Pour avoir la réduction"
            onClick={handleOpenCardModal}
            icon={HiMiniArrowDown}
          />
          <Flex
            alignItems="center"
            p={4}
            bgColor="white"
            borderRadius="2.5xl"
            gap={5}
          >
            <Box mb={-1.5}>
              <Image
                width={65}
                height={100}
                src="/images/dashboard/pass-card-fallback.png"
                alt="Image Pass CJE de secours"
              />
            </Box>
            <Flex flexDir="column">
              <Flex alignItems="center" gap={1}>
                <Box
                  w={1.5}
                  h={1.5}
                  bgColor={passCJEColor}
                  borderRadius="full"
                />
                <Text fontSize={12} fontWeight={500} color={passCJEColor}>
                  {passCJEStatus === "missing"
                    ? "Photo manquante"
                    : passCJEStatus === "pending"
                      ? "Vérification en cours"
                      : "Carte valide"}
                </Text>
              </Flex>
              <Flex
                alignItems="center"
                mt={6}
                gap={2}
                onClick={handleOpenCardModal}
              >
                <Text
                  fontSize={14}
                  fontWeight={500}
                  textDecoration="underline"
                  textDecorationThickness="2px"
                >
                  Afficher ma carte
                </Text>
                <Icon as={HiMiniArrowsPointingOut} w={4} h={4} />
              </Flex>
            </Flex>
          </Flex>
        </Flex>
      );
  }
};

type CouponCardProps = {
  coupon?: CouponIncluded;
  mode?: "default" | "wallet";
  link?: string;
  handleOpenExternalLink?: () => void;
};

const CouponCard = ({
  coupon,
  mode = "default",
  link,
  handleOpenExternalLink,
}: CouponCardProps) => {
  const toast = useToast();

  const {
    isOpen: isOpenUserCard,
    onOpen: onOpenUserCard,
    onClose: onCloseUserCard,
  } = useDisclosure();

  const handleCopyToClipboard = (text: string) => {
    toast({
      render: () => (
        <ToastComponent
          text="Code promo copié avec succès"
          icon={IoCloseCircleOutline}
        />
      ),
      duration: 2000,
    });
    navigator.clipboard.writeText(text);
  };

  return (
    <>
      <ConditionalLink
        condition={!!link}
        to={link as string}
        props={{ _hover: { textDecoration: "none" } }}
      >
        <Flex
          flexDir="column"
          pt={mode === "default" ? 2 : 1}
          pb={mode === "default" ? 3 : 1}
          px={mode === "default" ? 3 : 1}
          bg="white"
          borderRadius="2.5xl"
          shadow={
            coupon
              ? mode === "default"
                ? "default"
                : "default-wallet"
              : "none"
          }
          borderWidth={coupon ? 0 : 2}
          borderStyle={coupon ? "none" : "dashed"}
          h={mode === "default" ? "auto" : "245px"}
          borderColor="cje-gray.400"
          overflow="hidden"
        >
          <Flex
            bgColor={coupon ? coupon.offer.partner.color : "bgGray"}
            p={3}
            pb={5}
            gap={3}
            alignItems="center"
            borderTopRadius="1.5xl"
            position="relative"
            sx={{ ...dottedPattern("#ffffff") }}
          >
            <Flex
              alignItems="center"
              borderRadius="2.5xl"
              p={1.5}
              bgColor="white"
            >
              {coupon ? (
                <Image
                  src={coupon.offer.partner.icon.url ?? ""}
                  alt={coupon.offer.partner.icon.alt ?? ""}
                  width={34}
                  height={34}
                />
              ) : (
                <Box w={8} h={8} bgColor="white" borderRadius="2.5xl" />
              )}
            </Flex>
            {coupon ? (
              <Text color="white" fontSize={20} fontWeight={700}>
                {coupon.offer.partner.name}
              </Text>
            ) : (
              <Box w={20} h={3} bgColor="white" borderRadius="2.5xl" />
            )}
            {mode === "wallet" && (
              <Box ml="auto">
                {coupon ? (
                  <ExpiryTag
                    expiryDate={coupon?.offer.validityTo as string}
                    expiryTextMode="short"
                  />
                ) : (
                  <Box w={16} h={5} bgColor="white" borderRadius="2.5xl" />
                )}
              </Box>
            )}
          </Flex>
          <Flex
            flexDir="column"
            mt={4}
            bgColor="white"
            px={mode === "default" ? 0 : 2}
          >
            {coupon ? (
              <Text fontWeight={500} h="72px" noOfLines={3}>
                {`${coupon.offer.title} ${coupon.offer.subtitle ?? ""}`}
              </Text>
            ) : (
              <>
                <Box w="full" h={2} bgColor="bgGray" borderRadius="2.5xl" />
                <Box
                  w="60%"
                  h={2}
                  bgColor="bgGray"
                  borderRadius="2.5xl"
                  mt={1}
                />
              </>
            )}
            {coupon ? (
              <Flex
                flexDir="column"
                position="relative"
                gap={5}
                borderRadius="2xl"
                w="full"
                bgColor="bgGray"
                textAlign="center"
                px={4}
                py={2}
                mt={4}
                onClick={() => {
                  if (coupon.offer.kind === "code") {
                    push([
                      "trackEvent",
                      "Offre",
                      `${coupon.offer.partner.name} - ${coupon.offer.title} - Active - Aller sur le site`,
                    ]);
                    handleCopyToClipboard(coupon.code);
                  }
                }}
              >
                <CouponCodeCard
                  mode={mode}
                  coupon={coupon}
                  offerKind={coupon.offer.kind}
                  barCodeFormat={coupon.offer.barcodeFormat}
                  handleOpenCardModal={onOpenUserCard}
                />
              </Flex>
            ) : (
              <Center mt={6} textAlign="center" px={12}>
                <Text color="disabled" fontWeight={500}>
                  Vous n’avez pas encore enregistré de réductions.
                </Text>
              </Center>
            )}
            {coupon &&
              mode == "default" &&
              coupon.offer.kind.startsWith("code") &&
              coupon.offer.partner.url &&
              handleOpenExternalLink && (
                <Box mt={3}>
                  <BasicExternalCard
                    title={coupon.offer.partner.url.replace(
                      /(^\w+:|^)\/\//,
                      ""
                    )}
                    titleProps={{ noOfLines: 1 }}
                    text="uniquement sur internet"
                    onClick={handleOpenExternalLink}
                    icon={PiArrowUpRightBold}
                  />
                </Box>
              )}
          </Flex>
        </Flex>
      </ConditionalLink>
      <Modal isOpen={isOpenUserCard} onClose={onCloseUserCard} size="full">
        <ModalContent bgColor="primary">
          <ModalCloseButton
            position="relative"
            size="lg"
            color="white"
            ml={8}
            mt={6}
          />
          <ModalHeader
            color="white"
            px={16}
            textAlign="center"
            pb={0}
            fontSize={24}
            fontWeight={800}
          >
            Ma carte virtuelle “jeune engagé”
          </ModalHeader>
          <ModalBody pt={0} pb={8} px={8} mt={6}>
            <PassCard />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default CouponCard;
