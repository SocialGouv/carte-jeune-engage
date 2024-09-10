import { Image } from "@chakra-ui/next-js";
import {
  Box,
  Center,
  CircularProgress,
  Divider,
  Flex,
  Icon,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useState } from "react";
import CouponCard from "~/components/cards/CouponCard";
import LoadingLoader from "~/components/LoadingLoader";
import BaseModal from "~/components/modals/BaseModal";
import OfferHeaderWrapper from "~/components/wrappers/OfferHeaderWrapper";
import { hasAccessToOffer } from "~/guards/hasAccessToOffer";
import { api } from "~/utils/api";
import { isIOS } from "~/utils/tools";
import NextImage from "next/image";
import { HiOutlineClock } from "react-icons/hi2";
import InStoreSection from "~/components/offer/InStoreSection";
import { OfferIncluded } from "~/server/api/routers/offer";

export const getServerSideProps: GetServerSideProps = async (context) => {
  return hasAccessToOffer(context);
};

export default function CouponPage() {
  const router = useRouter();

  const { id } = router.query as {
    id: string;
  };

  const { data: resultCoupon, isLoading: isLoadingCoupon } =
    api.coupon.getOne.useQuery(
      {
        offer_id: parseInt(id as string),
      },
      { enabled: id !== undefined }
    );

  const { data: coupon } = resultCoupon || {};

  const differenceInDays = Math.floor(
    (new Date(coupon?.offer.validityTo as string).setHours(0, 0, 0, 0) -
      new Date().setHours(0, 0, 0, 0)) /
      (1000 * 3600 * 24)
  );

  const expiryText =
    differenceInDays > 0
      ? `Fin dans ${differenceInDays} jour${differenceInDays > 1 ? "s" : ""}`
      : "Offre expirée";

  const [timeoutIdExternalLink, setTimeoutIdExternalLink] =
    useState<NodeJS.Timeout>();
  const [intervalIdExternalLink, setIntervalIdExternalLink] =
    useState<NodeJS.Timeout>();
  const [timeoutProgress, setTimeoutProgress] = useState<number>(0);

  const {
    isOpen: isOpenExternalLink,
    onOpen: onOpenExternalLink,
    onClose: onCloseExternalLink,
  } = useDisclosure({
    onOpen: () => {
      const totalTimeout = 2000;
      const startTime = Date.now();

      const timeoutId = setTimeout(() => {
        clearInterval(intervalIdExternalLink);
        let a = document.createElement("a");
        document.body.appendChild(a);
        a.classList.add("hidden");
        a.href = coupon?.offer?.url as string;
        if (!isIOS()) a.target = "_blank";
        a.click();
        document.body.removeChild(a);
        onCloseExternalLink();
      }, totalTimeout);

      setTimeoutIdExternalLink(timeoutId);

      const intervalId = setInterval(() => {
        const currentTime = Date.now();
        const elapsedTime = currentTime - startTime;

        setTimeoutProgress(
          Math.min((elapsedTime / totalTimeout) * 100 + 20, 100)
        );

        if (elapsedTime >= totalTimeout) clearInterval(intervalId);
      }, 100);

      setIntervalIdExternalLink(intervalId);
    },
    onClose: () => {
      clearInterval(intervalIdExternalLink);
      setTimeoutProgress(0);
      clearTimeout(timeoutIdExternalLink);
    },
  });

  if (isLoadingCoupon || !coupon)
    return (
      <OfferHeaderWrapper kind="coupon">
        <Center h="full">
          <LoadingLoader />
        </Center>
      </OfferHeaderWrapper>
    );

  return (
    <OfferHeaderWrapper
      kind="coupon"
      partnerColor={coupon.offer.partner.color}
      headerComponent={
        <CouponCard
          coupon={coupon}
          handleOpenExternalLink={onOpenExternalLink}
        />
      }
    >
      <Flex flexDir="column">
        <Flex
          align="center"
          borderRadius="2xl"
          color="white"
          py={1}
          px={2}
          mt={3}
        >
          <Icon as={HiOutlineClock} w={4} h={4} mr={2} />
          <Text fontSize={14} fontWeight={700}>
            {expiryText}
          </Text>
        </Flex>
        {coupon.offer.kind.startsWith("voucher") && (
          <Box mt={4}>
            <InStoreSection
              offer={coupon.offer as OfferIncluded}
              withoutBackground
            />
          </Box>
        )}
        <BaseModal
          pb={1}
          heightModalContent="100%"
          isOpen={isOpenExternalLink}
          onClose={onCloseExternalLink}
        >
          <Flex
            flexDir="column"
            justifyContent="space-around"
            alignItems="center"
            h="full"
          >
            <CircularProgress
              value={timeoutProgress}
              color="blackLight"
              sx={{
                "& > div:first-child": {
                  transitionProperty: "width",
                },
              }}
            />
            <Text fontWeight={800} fontSize={38} textAlign="center" mb={16}>
              On vous emmène
              <br />
              sur le site de
              <br />
              <Flex alignItems="center" justifyContent="center" mt={4} mb={1}>
                <Image
                  as={NextImage}
                  src={coupon.offer.partner.icon.url as string}
                  alt={coupon.offer.partner.icon.alt as string}
                  bgColor="white"
                  p={1}
                  width={12}
                  height={12}
                  borderRadius="2.5xl"
                />
                <Text ml={3} fontSize={24}>
                  {coupon.offer.partner.name}
                </Text>
              </Flex>
              en toute sécurité
            </Text>
            <Text fontSize={12} fontWeight={700} textAlign="center" px={16}>
              🍪 N’oubliez pas d’accepter les cookies si on vous le demande.
              <Divider borderWidth={0} my={2} />
              Sinon la réduction peut ne pas fonctionner 😬
            </Text>
          </Flex>
        </BaseModal>
      </Flex>
    </OfferHeaderWrapper>
  );
}
