import {
  Box,
  CircularProgress,
  Divider,
  Flex,
  Icon,
  Text,
} from "@chakra-ui/react";
import { HiOutlineClock } from "react-icons/hi2";
import InStoreSection from "../InStoreSection";
import BaseModal from "~/components/modals/BaseModal";
import Image from "next/image";
import { OfferIncluded } from "~/server/api/routers/offer";
import { CouponIncluded } from "~/server/api/routers/coupon";

type CouponContentProps = {
  offer: OfferIncluded;
  coupon: CouponIncluded;
  isOpenExternalLink: boolean;
  onCloseExternalLink: () => void;
  timeoutProgress: number;
};

const CouponContent = (props: CouponContentProps) => {
  const {
    offer,
    coupon,
    isOpenExternalLink,
    onCloseExternalLink,
    timeoutProgress,
  } = props;

  const differenceInDays = Math.floor(
    (new Date(coupon?.offer.validityTo as string).setHours(0, 0, 0, 0) -
      new Date().setHours(0, 0, 0, 0)) /
      (1000 * 3600 * 24)
  );

  const expiryText =
    differenceInDays > 0
      ? `Fin dans ${differenceInDays} jour${differenceInDays > 1 ? "s" : ""}`
      : "Offre expirée";

  return (
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
      {coupon?.offer.kind.startsWith("voucher") && (
        <Box mt={4}>
          <InStoreSection offer={offer} withoutBackground />
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
              <Box bgColor="white" p={1} borderRadius="2.5xl">
                <Image
                  src={coupon?.offer.partner.icon.url as string}
                  alt={coupon?.offer.partner.icon.alt as string}
                  width={12}
                  height={12}
                />
              </Box>
              <Text ml={3} fontSize={24}>
                {coupon?.offer.partner.name}
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
  );
};

export default CouponContent;
