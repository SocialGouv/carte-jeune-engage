import { Box, Center, Flex, Icon, Text, useToast } from "@chakra-ui/react";
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

const CouponCodeCard = ({
  coupon,
  offerKind,
  barCodeFormat,
}: {
  coupon: CouponIncluded;
  offerKind: Offer["kind"];
  barCodeFormat: Offer["barcodeFormat"];
}) => {
  switch (offerKind) {
    case "code":
    case "code_space":
      return (
        <Text fontSize={24} fontWeight={800} letterSpacing={2}>
          {offerKind === "code"
            ? coupon.code
            : "Le code est déjà appliqué sur le site 😉"}
        </Text>
      );
    case "voucher":
    case "voucher_pass":
      return (
        <Flex flexDir="column">
          <Flex w="auto" bgColor="white" borderRadius="2lg" p={2}>
            <Barcode
              value={coupon.code}
              background="white"
              format={
                barCodeFormat === "upc" ? "UPC" : (barCodeFormat ?? "CODE128")
              }
              height={70}
            />
          </Flex>
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
        </Flex>
      );
  }
};

type CouponCardProps = {
  coupon?: CouponIncluded;
  mode?: "default" | "wallet";
  handleOpenExternalLink?: () => void;
};

const CouponCard = ({
  coupon,
  mode = "default",
  handleOpenExternalLink,
}: CouponCardProps) => {
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
      pt={mode === "default" ? 2 : 1}
      px={mode === "default" ? 3 : 1}
      pb={mode === "default" ? 12 : 0}
      bg="white"
      borderRadius="2.5xl"
      shadow={
        coupon ? (mode === "default" ? "default" : "default-wallet") : "none"
      }
      borderWidth={coupon ? 0 : 2}
      borderStyle={coupon ? "none" : "dashed"}
      borderColor="cje-gray.400"
      h={mode === "default" ? "430px" : "245px"}
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
        <Flex alignItems="center" borderRadius="2.5xl" p={1} bgColor="white">
          {coupon ? (
            <Image
              src={coupon.offer.partner.icon.url ?? ""}
              alt={coupon.offer.partner.icon.alt ?? ""}
              width={42}
              height={42}
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
      </Flex>
      <Flex
        flexDir="column"
        mt={4}
        bgColor="white"
        gap={2}
        px={mode === "default" ? 0 : 2}
      >
        {coupon ? (
          <Text fontWeight={500} h="66px">
            {coupon.offer.title}
          </Text>
        ) : (
          <>
            <Box w="full" h={2} bgColor="bgGray" borderRadius="2.5xl" />
            <Box w="60%" h={2} bgColor="bgGray" borderRadius="2.5xl" mt={1} />
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
            py={6}
            filter={mode === "default" ? "none" : "blur(5px)"}
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
              coupon={coupon}
              offerKind={coupon.offer.kind}
              barCodeFormat={coupon.offer.barcodeFormat}
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
          coupon.offer.kind === "code" &&
          coupon.offer.partner.url && (
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
