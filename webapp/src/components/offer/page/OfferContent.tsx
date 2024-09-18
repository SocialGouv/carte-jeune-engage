import {
  Box,
  Button,
  Center,
  Divider,
  Flex,
  HStack,
  Icon,
  ListItem,
  OrderedList,
  Text,
  UnorderedList,
  useDisclosure,
} from "@chakra-ui/react";
import { push } from "@socialgouv/matomo-next";
import { HiArrowRight } from "react-icons/hi";
import { HiBookmark, HiMiniEye, HiOutlineBookmark } from "react-icons/hi2";
import InStoreSection from "../InStoreSection";
import TextWithLinks from "../TextWithLinks";
import Image from "next/image";
import { dottedPattern } from "~/utils/chakra-theme";
import { OfferIncluded } from "~/server/api/routers/offer";
import { useMemo, useRef, useState } from "react";
import { getItemsTermsOfUse } from "~/payload/components/CustomSelectTermsOfUse";
import { StackItem } from "../StackItems";
import { getItemsConditionBlocks } from "~/payload/components/CustomSelectBlocksOfUse";
import ReactIcon from "~/utils/dynamicIcon";
import BookmarkKeepOfferModal from "~/components/modals/BookmarkKeepOfferModal";
import { api } from "~/utils/api";
import { CouponIncluded } from "~/server/api/routers/coupon";

type OfferContentProps = {
  offer: OfferIncluded;
  coupon?: CouponIncluded;
  handleValidateOffer: (
    offerId: number,
    displayCoupon?: boolean
  ) => Promise<void>;
  isLoadingValidateOffer: boolean;
};

const OfferContent = (props: OfferContentProps) => {
  const { offer, coupon, handleValidateOffer, isLoadingValidateOffer } = props;
  const hasCoupon = !!coupon;
  const utils = api.useUtils();

  const { mutateAsync } = api.coupon.unassignFromUser.useMutation({
    onSuccess: () => utils.coupon.getOne.invalidate(),
  });

  const handleRemoveCouponFromUser = async () => {
    if (coupon) await mutateAsync({ coupon_id: coupon.id });
  };

  const {
    isOpen: isOpenBookmarkKeepOfferModal,
    onOpen: onOpenBookmarkKeepOfferModal,
    onClose: onCloseBookmarkKeepOfferModal,
  } = useDisclosure();

  const conditionsRef = useRef<HTMLUListElement>(null);
  const [isConditionsOpen, setIsConditionsOpen] = useState(false);

  const offerConditionBlocks = useMemo(() => {
    if (!offer) return [];
    return getItemsConditionBlocks(offer.kind).filter((item) =>
      offer.conditionBlocks
        ?.map((conditionBlock) => conditionBlock.slug)
        .includes(item.slug)
    ) as StackItem[];
  }, [offer]);

  const itemsTermsOfUse = useMemo(() => {
    if (!offer) return [];
    return getItemsTermsOfUse(offer.kind).filter((item) =>
      offer.termsOfUse?.map((termOfUse) => termOfUse.slug).includes(item.slug)
    ) as StackItem[];
  }, [offer]);

  const offerConditions = useMemo(() => {
    if (!offer) return [];
    if (!isConditionsOpen) return offer.conditions?.slice(0, 2) ?? [];
    return offer.conditions ?? [];
  }, [offer, isConditionsOpen]);

  return (
    <Flex flexDir="column">
      <Box mt={6} px={4} w="full">
        <Button
          fontSize={14}
          w="full"
          size="md"
          isLoading={isLoadingValidateOffer}
          onClick={() => {
            push(["trackEvent", "Inactive", "J'active mon offre"]);
            handleValidateOffer(offer.id);
          }}
          leftIcon={<Icon as={HiMiniEye} w={5} h={5} />}
        >
          Voir mon code
        </Button>
      </Box>
      {offerConditionBlocks.length > 0 && (
        <Flex
          gap={3}
          mt={7}
          w="full"
          h="max-content"
          py={1}
          pl={4}
          overflowX="scroll"
          sx={{
            "&::-webkit-scrollbar": {
              display: "none",
            },
          }}
        >
          {offerConditionBlocks.map(({ text, icon }, index) => (
            <Flex
              key={text}
              position="relative"
              minW="43%"
              flexDir="column"
              alignItems="center"
              justifyContent="center"
              py={4}
              px={6}
            >
              <Box
                position="absolute"
                inset={0}
                bg="bgGray"
                zIndex={1}
                borderRadius="3xl"
                transform={`rotate(${index % 2 === 0 ? 3 : -2}deg)`}
              />
              <Box p={4} bg="white" borderRadius="full" zIndex={2}>
                {typeof icon === "string" && (
                  <ReactIcon icon={icon} size={24} color="inherit" />
                )}
              </Box>
              <Text fontWeight={500} textAlign="center" mt={2} zIndex={2}>
                {text}
              </Text>
            </Flex>
          ))}
          <Center minW="43%" mr={4} key="read-all-conditions">
            <Text
              fontWeight={800}
              color="blackLight"
              textDecor="underline"
              textDecorationThickness="2px"
              textUnderlineOffset={2}
              onClick={() => {
                setIsConditionsOpen(true);
                conditionsRef.current?.scrollIntoView({
                  behavior: "smooth",
                });
              }}
            >
              Lire toutes
              <br />
              les conditions{" "}
              <Icon
                as={HiArrowRight}
                w={4}
                h={4}
                borderBottom="2px solid black"
                pb="1px"
                mb={-1}
              />
            </Text>
          </Center>
        </Flex>
      )}
      {offer.kind.startsWith("voucher") && (
        <Box mt={8} px={4} w="full">
          <InStoreSection offer={offer} />
        </Box>
      )}
      <Flex flexDir="column" px={4}>
        {itemsTermsOfUse.length > 0 && (
          <HStack spacing={4}>
            <Flex flexDir="column" gap={3} mt={8}>
              <Text fontWeight="extrabold" fontSize={20}>
                Comment utiliser l'offre ?
              </Text>
              <OrderedList fontWeight={500} pl={3}>
                {itemsTermsOfUse.map((termOfUse) => (
                  <ListItem key={termOfUse.text} mb={2}>
                    <TextWithLinks text={termOfUse.text} />
                  </ListItem>
                ))}
              </OrderedList>
            </Flex>
          </HStack>
        )}
        {!!(offer.conditions ?? []).length && (
          <>
            <Divider my={6} />
            <Flex flexDir="column">
              <Text fontWeight="extrabold" fontSize={20}>
                Conditions de l'offre
              </Text>
              <UnorderedList fontWeight={500} pl={3} mt={3} ref={conditionsRef}>
                {offerConditions.map((condition) => (
                  <ListItem key={condition.text} mb={2}>
                    <TextWithLinks text={condition.text} />
                  </ListItem>
                ))}
              </UnorderedList>
              {(offer?.conditions ?? []).length > 2 && !isConditionsOpen && (
                <Text
                  as="span"
                  alignSelf="start"
                  fontWeight={700}
                  lineHeight="shorter"
                  borderBottom="2px solid black"
                  onClick={() => {
                    // push([
                    //   "trackEvent",
                    //   "Offre",
                    //   `${offer.partner.name} - ${offer.title} - ${
                    //     !!coupon ? "Active" : "Inactive"
                    //   } - Conditions`,
                    // ]);
                    setIsConditionsOpen(true);
                  }}
                >
                  Lire toutes les conditions
                </Text>
              )}
            </Flex>
          </>
        )}
        <Divider my={6} />
        <Flex flexDir="column" gap={3} w="full" pb={10}>
          <Flex alignItems="center" gap={2.5}>
            <Box bg="white" borderRadius="2lg" p={1}>
              <Image
                src={offer.partner.icon.url as string}
                alt="Logo partenaire"
                width={40}
                height={40}
              />
            </Box>
            <Text fontWeight="extrabold">{offer.partner.name}</Text>
          </Flex>
          <Text>{offer.partner.description}</Text>
        </Flex>
      </Flex>
      <Box
        shadow="2xl"
        position="relative"
        sx={{ ...dottedPattern(offer?.partner?.color as string) }}
        w="full"
      />
      <Box h="200px" w="full" bgColor={offer?.partner.color} />
      <Flex
        position="fixed"
        zIndex={10}
        alignItems="center"
        bottom={0}
        insetX={0}
        bg="white"
        borderTopColor="cje-gray.300"
        borderTopWidth={1}
        py={4}
        px={4}
        gap={4}
      >
        <Button
          w="40%"
          fontSize={16}
          borderWidth={1}
          borderColor={hasCoupon ? "transparent" : "cje-gray.100"}
          color={hasCoupon ? "white" : "blackLight"}
          colorScheme={hasCoupon ? "primaryShades" : "inherit"}
          isLoading={!hasCoupon && isLoadingValidateOffer}
          onClick={() => {
            if (hasCoupon) {
              onOpenBookmarkKeepOfferModal();
            } else {
              handleValidateOffer(offer.id, false);
            }
          }}
          leftIcon={
            <Icon as={hasCoupon ? HiBookmark : HiOutlineBookmark} w={5} h={5} />
          }
        >
          {hasCoupon ? "Enregistré" : "Enregistrer"}
        </Button>
        <Button
          w="60%"
          fontSize={16}
          colorScheme="blackBtn"
          leftIcon={<Icon as={HiMiniEye} w={5} h={5} />}
          isLoading={isLoadingValidateOffer}
          onClick={() => {
            push([
              "trackEvent",
              "Inactive",
              "J'active mon offre - Bas de page",
            ]);
            handleValidateOffer(offer.id);
          }}
        >
          Voir mon code
        </Button>
      </Flex>
      <BookmarkKeepOfferModal
        isOpen={isOpenBookmarkKeepOfferModal}
        onClose={onCloseBookmarkKeepOfferModal}
        handleRemoveCouponFromUser={handleRemoveCouponFromUser}
      />
    </Flex>
  );
};
export default OfferContent;
