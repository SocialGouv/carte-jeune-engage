import {
  Box,
  Button,
  Divider,
  Flex,
  HStack,
  Heading,
  Icon,
  Text,
  useToast,
} from "@chakra-ui/react";
import Link from "next/link";
import { ReactNode, useMemo } from "react";
import Barcode from "react-barcode";
import { FiCopy, FiLock, FiUnlock } from "react-icons/fi";
import {
  HiBuildingStorefront,
  HiCursorArrowRays,
  HiOutlineInformationCircle,
  HiReceiptPercent,
} from "react-icons/hi2";
import { IoCloseCircleOutline } from "react-icons/io5";
import { getItemsTermsOfUse } from "~/payload/components/CustomSelectField";
import { useAuth } from "~/providers/Auth";
import { CouponIncluded } from "~/server/api/routers/coupon";
import { OfferIncluded } from "~/server/api/routers/offer";
import ToastComponent from "../ToastComponent";
import { PassIcon } from "../icons/pass";
import PassInCreation from "../offer/PassInCreation";
import { push } from "@socialgouv/matomo-next";

type CouponWrapperProps = {
  children: ReactNode;
  coupon?: CouponIncluded;
  offer: OfferIncluded;
  handleOpenOtherConditions: () => void;
  handleActivateOffer: () => void;
  handleOpenExternalLink: () => void;
};

const CTAButton = ({
  offer,
  handleOpenExternalLink,
}: {
  offer: OfferIncluded;
  handleOpenExternalLink: () => void;
}) => {
  return (
    <Box>
      {offer.kind.startsWith("code") ? (
        <Button
          onClick={() => {
            push([
              "trackEvent",
              "Offre",
              offer.partner.name,
              offer.title,
              "Active",
              "Aller sur le site",
            ]);
            handleOpenExternalLink();
          }}
          w="full"
        >
          Aller sur le site
        </Button>
      ) : (
        <Link
          href="/dashboard/account/card"
          onClick={() => {
            push([
              "trackEvent",
              "Offre",
              offer.partner.name,
              offer.title,
              "Active",
              "Présenter ma carte CJE",
            ]);
          }}
        >
          <Button leftIcon={<Icon as={PassIcon} w={6} h={6} />} w="full">
            Présenter ma carte CJE
          </Button>
        </Link>
      )}
    </Box>
  );
};

const CouponWrapper = ({
  children,
  coupon,
  offer,
  handleOpenOtherConditions,
  handleActivateOffer,
  handleOpenExternalLink,
}: CouponWrapperProps) => {
  const { user } = useAuth();
  const toast = useToast();

  const isPassInCreation = useMemo(() => {
    if (!user) return false;
    return user.image !== undefined && user.status_image !== "approved";
  }, [user]);

  const itemsSimpleTermsOfUse = useMemo(() => {
    if (!offer) return [];
    return [
      {
        icon: "HiMiniCheck",
        text: !!coupon ? "Cette offre est active" : "J'active cette offre",
        slug: "activate",
      },
      getItemsTermsOfUse(offer.kind).filter((item) =>
        offer.termsOfUse
          ?.filter((termOfUse) => termOfUse.isHighlighted)
          .map((termOfUse) => termOfUse.slug)
          .includes(item.slug)
      ) ?? [],
    ].flat();
  }, [offer, coupon]);

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

  const displayCoupon = () => {
    return (
      <Flex
        flexDir="column"
        position="relative"
        gap={5}
        borderRadius="xl"
        w="full"
        bgColor={coupon ? "bgWhite" : "cje-gray.500"}
        border={coupon ? "1px solid" : "none"}
        borderColor="#B5BBBD"
        textAlign="center"
        px={4}
        py={5}
        mt={8}
      >
        {coupon && (
          <HStack spacing={3} align="center" alignSelf="center">
            <Icon as={HiReceiptPercent} w={6} h={6} />
            <Text fontSize="lg" fontWeight="bold">
              {offer.kind === "code"
                ? "Mon code promo à saisir"
                : "Mon code barre à scanner"}
            </Text>
          </HStack>
        )}
        <Flex
          alignItems="center"
          justifyContent="center"
          gap={3}
          borderRadius="lg"
          bgColor={coupon ? "white" : "cje-gray.500"}
          py={8}
          px={2}
          wordBreak={"break-all"}
          position="relative"
        >
          {offer.kind === "code" ? (
            <Text fontSize="2xl" fontWeight="bold" letterSpacing={3}>
              {coupon?.code ? coupon.code : "6FHDJFHEIDJF"}
            </Text>
          ) : (
            <Barcode
              value={coupon?.code ?? "6FHDJFHEIDJF"}
              background={coupon ? "white" : "#edeff3"}
              format={
                coupon?.code && offer?.barcodeFormat
                  ? offer?.barcodeFormat
                  : "CODE128"
              }
              height={70}
            />
          )}
          {coupon && offer.kind === "code" && (
            <Icon
              as={FiCopy}
              w={6}
              h={6}
              mt={1}
              onClick={() => handleCopyToClipboard(coupon?.code as string)}
            />
          )}
          <Box
            id="blur-overlay"
            position="absolute"
            top={0}
            left={0}
            w="full"
            h="full"
            backdropFilter={"blur(4.5px)"}
            pointerEvents={"none"}
            transition="visibility 1s ease"
          />
        </Flex>
        {coupon && (
          <HStack spacing={2} align="center">
            <Icon as={HiOutlineInformationCircle} w={6} h={6} mt={0.5} />
            <Text
              fontWeight="medium"
              textDecoration="underline"
              textUnderlineOffset={3}
              onClick={() => {
                push([
                  "trackEvent",
                  "Offre",
                  offer.partner.name,
                  offer.title,
                  "Active",
                  "Conditions 2",
                ]);
                handleOpenOtherConditions();
              }}
            >
              Conditions d’utilisation
            </Text>
          </HStack>
        )}
        <Flex
          id="coupon-code-icon"
          position="absolute"
          bgColor="white"
          p={5}
          shadow="md"
          borderRadius="full"
          justifyContent="center"
          alignItems="center"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
        >
          <Icon
            id="coupon-code-icon-unlock"
            as={FiUnlock}
            display="none"
            w={6}
            h={6}
          />
          <Icon id="coupon-code-icon-lock" as={FiLock} w={6} h={6} />
        </Flex>
      </Flex>
    );
  };

  const getCouponWrapperContent = () => {
    if (offer.kind.startsWith("voucher") && isPassInCreation) {
      return <PassInCreation />;
    }

    const isOfferWithoutCoupon =
      offer.kind === "voucher_pass" || offer.kind === "code_space";

    return (
      <>
        {!isOfferWithoutCoupon && displayCoupon()}
        <Flex flexDir="column" mt={isOfferWithoutCoupon ? 20 : 6}>
          {!coupon ? (
            <Button
              onClick={() => {
                push(["trackEvent", "Inactive", "J'active mon offre"]);
                handleActivateOffer();
              }}
            >
              Obtenir la réduction
            </Button>
          ) : (
            <CTAButton
              offer={offer}
              handleOpenExternalLink={handleOpenExternalLink}
            />
          )}
        </Flex>
        <Divider my={6} />
      </>
    );
  };

  return (
    <Flex
      flexDir="column"
      overflowY="auto"
      zIndex={1}
      sx={{
        "::-webkit-scrollbar": {
          display: "none",
        },
      }}
      px={8}
      h="full"
      pb={12}
    >
      <Heading
        as="h3"
        fontSize="2xl"
        fontWeight="extrabold"
        textAlign="center"
        mt={6}
      >
        {offer.title}
      </Heading>
      <Flex alignItems="center" alignSelf="center" gap={2} mt={4}>
        <Icon
          as={
            offer.kind.startsWith("code")
              ? HiCursorArrowRays
              : HiBuildingStorefront
          }
          w={6}
          h={6}
        />
        <Text fontWeight="medium">
          {offer.kind.startsWith("code")
            ? `En ligne sur ${offer.partner.name}`
            : `dans ${offer.nbOfEligibleStores ?? 1} magasins participants`}
        </Text>
      </Flex>
      {getCouponWrapperContent()}
      <Flex flexDir="column">{children}</Flex>
    </Flex>
  );
};

export default CouponWrapper;
