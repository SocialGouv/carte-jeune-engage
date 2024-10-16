import {
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  Link,
  Text,
  useToast,
} from "@chakra-ui/react";
import { ReactNode } from "react";
import Barcode from "react-barcode";
import { FiCopy, FiLock, FiUnlock } from "react-icons/fi";
import { HiMiniEye, HiReceiptPercent } from "react-icons/hi2";
import { IoCloseCircleOutline } from "react-icons/io5";
import { CouponIncluded } from "~/server/api/routers/coupon";
import { OfferIncluded } from "~/server/api/routers/offer";
import ToastComponent from "../ToastComponent";
import { PassIcon } from "../icons/pass";
import { push } from "@socialgouv/matomo-next";
import PassCard from "../account/PassCard";
import { dottedPattern } from "~/utils/chakra-theme";
import NextLink from "next/link";

type CouponWrapperProps = {
  children: ReactNode;
  coupon?: CouponIncluded;
  offer: OfferIncluded;
  handleActivateOffer: (offer_id: number) => void;
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
              `${offer.partner.name} - ${offer.title} - Active - Aller sur le site`,
            ]);
            handleOpenExternalLink();
          }}
          w="full"
        >
          Aller sur le site
        </Button>
      ) : (
        <Flex
          flexDir="column"
          border="1px solid"
          borderRadius="1.5xl"
          borderColor="borderGray"
          gap={4}
          p={6}
        >
          <Flex alignSelf="center" alignItems="center" gap={2}>
            <PassIcon w={5} h={6} />
            <Text fontSize="lg" fontWeight="bold">
              Ma carte CJE
            </Text>
          </Flex>
          <PassCard offer={offer} />
        </Flex>
        // <Link
        //   href="/dashboard/account/card"
        //   onClick={() => {
        //     push([
        //       "trackEvent",
        //       "Offre",
        //       offer.partner.name,
        //       offer.title,
        //       "Active",
        //       "Présenter ma carte CJE",
        //     ]);
        //   }}
        // >
        //   <Button leftIcon={<Icon as={PassIcon} w={6} h={6} />} w="full">
        //     Présenter ma carte CJE
        //   </Button>
        // </Link>
      )}
    </Box>
  );
};

const CouponWrapper = ({
  children,
  coupon,
  offer,
  handleActivateOffer,
  handleOpenExternalLink,
}: CouponWrapperProps) => {
  const toast = useToast();

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

  // Keep logic for coupon page
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
        borderColor="borderGray"
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
                // coupon?.code && offer?.barcodeFormat
                //   ? offer?.barcodeFormat
                //   : "CODE128"
                "CODE128"
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
            backdropFilter={!coupon ? "blur(4.5px)" : "blur(0)"}
            pointerEvents="none"
          />
        </Flex>
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

  return <></>;
};

export default CouponWrapper;
