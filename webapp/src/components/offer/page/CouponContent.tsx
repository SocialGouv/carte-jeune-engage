import {
  Box,
  CircularProgress,
  Divider,
  Flex,
  Icon,
  Modal,
  ModalBody,
  ModalContent,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import Image from "next/image";
import {
  HiChevronRight,
  HiExclamationCircle,
  HiOutlineClock,
} from "react-icons/hi2";
import { CouponIncluded } from "~/server/api/routers/coupon";
import { OfferIncluded } from "~/server/api/routers/offer";
import { getExpiryObject } from "../ExpiryTag";
import InStoreSection from "../InStoreSection";
import CouponUsedBox from "./CouponUsedBox";
import IssueModal from "~/components/modals/IssueModal";

type CouponContentProps = {
  offer: OfferIncluded;
  coupon: CouponIncluded;
  isOpenExternalLink: boolean;
  onCloseExternalLink: () => void;
  onCouponUsed: () => void;
  timeoutProgress: number;
};

const CouponContent = (props: CouponContentProps) => {
  const {
    offer,
    coupon,
    isOpenExternalLink,
    onCloseExternalLink,
    onCouponUsed,
    timeoutProgress,
  } = props;

  const {
    isOpen: isOpenIssueModal,
    onClose: onCloseIssueModal,
    onOpen: onOpenIssueModal,
  } = useDisclosure();

  const { expiryText } = getExpiryObject(coupon.offer.validityTo);

  return (
    <Flex flexDir="column">
      {!coupon.used && (
        <CouponUsedBox coupon={coupon} confirmCouponUsed={onCouponUsed} />
      )}
      <Flex
        p={4}
        bg="white"
        rounded="2xl"
        mt={2}
        alignItems="center"
        onClick={onOpenIssueModal}
      >
        <Icon
          as={HiExclamationCircle}
          w={5}
          h={5}
          mb={-0.5}
          color="error"
          mr={4}
        />
        <Text fontWeight={500}>Je rencontre un problème</Text>
        <Icon as={HiChevronRight} w={5} h={5} mb={-0.5} ml="auto" />
        <IssueModal
          isOpen={isOpenIssueModal}
          onClose={onCloseIssueModal}
          kind="coupon"
          coupon_id={coupon.id}
        />
      </Flex>
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
      <Modal
        isOpen={isOpenExternalLink}
        onClose={onCloseExternalLink}
        size="full"
      >
        <ModalContent h="full">
          <ModalBody>
            <Flex
              flexDir="column"
              justifyContent="space-around"
              alignItems="center"
              h="full"
              pt={14}
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
              <Text fontWeight={800} fontSize={34} textAlign="center" mb={16}>
                On vous emmène
                <br />
                sur le site de
                <br />
                <Flex alignItems="center" justifyContent="center" mt={4} mb={1}>
                  <Box bgColor="white" p={1} borderRadius="2.5xl">
                    <Image
                      src={coupon?.offer.partner.icon.url as string}
                      alt={coupon?.offer.partner.icon.alt as string}
                      width={14}
                      height={14}
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
          </ModalBody>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default CouponContent;
