import { Flex, Icon, Link, Text, useToast } from "@chakra-ui/react";
import Image from "next/image";
import { dottedPattern } from "~/utils/chakra-theme";
import { CouponIncluded } from "~/server/api/routers/coupon";
import ToastComponent from "../ToastComponent";
import { IoCloseCircleOutline } from "react-icons/io5";
import Barcode from "react-barcode";
import { Offer } from "~/payload/payload-types";
import { PiArrowUpRightBold } from "react-icons/pi";
import NextLink from "next/link";
import { push } from "@socialgouv/matomo-next";

const CouponCodeCard = ({
  code,
  offerKind,
  barCodeFormat,
}: {
  code: string;
  offerKind: Offer["kind"];
  barCodeFormat: Offer["barcodeFormat"];
}) => {
  switch (offerKind) {
    case "code":
    case "code_space":
      return (
        <Text fontSize={24} fontWeight={800} letterSpacing={2}>
          {offerKind === "code"
            ? code
            : "Le code est déjà appliqué sur le site 😉"}
        </Text>
      );
    case "voucher":
    case "voucher_pass":
      return (
        <Barcode
          value={code}
          background="white"
          format={
            barCodeFormat === "upc" ? "UPC" : (barCodeFormat ?? "CODE128")
          }
          height={70}
        />
      );
  }
};

type CouponCardProps = {
  coupon: CouponIncluded;
  handleOpenExternalLink: () => void;
};

const CouponCard = ({ coupon, handleOpenExternalLink }: CouponCardProps) => {
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

  return (
    <Flex
      flexDir="column"
      pt={2}
      px={3}
      pb={12}
      bg="white"
      borderRadius="2.5xl"
      shadow="default"
    >
      <Flex
        bgColor={coupon.offer.partner.color}
        p={3}
        pb={5}
        gap={3}
        alignItems="center"
        borderTopRadius="1.5xl"
        position="relative"
        sx={{ ...dottedPattern("#ffffff") }}
      >
        <Flex alignItems="center" borderRadius="2.5xl" p={1} bgColor="white">
          <Image
            src={coupon.offer.partner.icon.url ?? ""}
            alt={coupon.offer.partner.icon.alt ?? ""}
            width={42}
            height={42}
          />
        </Flex>
        <Text color="white" fontSize={20} fontWeight={700}>
          {coupon.offer.partner.name}
        </Text>
      </Flex>
      <Flex flexDir="column" mt={4} bgColor="white" gap={2}>
        <Text fontWeight={500} h="66px">
          {coupon.offer.title}
        </Text>
        <Flex
          flexDir="column"
          position="relative"
          gap={5}
          borderRadius="2.5xl"
          w="full"
          bgColor="bgGray"
          textAlign="center"
          px={4}
          py={6}
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
            code={coupon.code}
            offerKind={coupon.offer.kind}
            barCodeFormat={coupon.offer.barcodeFormat}
          />
        </Flex>
        {coupon.offer.kind === "code" && coupon.offer.partner.url && (
          <Flex
            flexDir="column"
            alignItems="start"
            gap={2}
            bg="blackLight"
            color="white"
            borderRadius="2.5xl"
            mt={1}
            p={5}
            onClick={handleOpenExternalLink}
          >
            <Text fontWeight={500} fontSize={12} mt={1}>
              uniquement sur internet
            </Text>
            <Flex
              alignItems="center"
              justifyContent="space-between"
              w="full"
              gap={1}
            >
              <Text fontWeight={800} fontSize={20} noOfLines={1}>
                {coupon.offer.partner.url.replace(/(^\w+:|^)\/\//, "")}
              </Text>
              <Icon as={PiArrowUpRightBold} w={6} h={6} mt={1} />
            </Flex>
          </Flex>
        )}
      </Flex>
    </Flex>
  );
};

export default CouponCard;
