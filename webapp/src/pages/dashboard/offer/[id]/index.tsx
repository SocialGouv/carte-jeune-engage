import {
  Box,
  Center,
  Divider,
  Flex,
  HStack,
  Icon,
  Text,
  Link,
  VStack,
  UnorderedList,
  ListItem,
  OrderedList,
  Button,
} from "@chakra-ui/react";
import { push } from "@socialgouv/matomo-next";
import Image from "next/image";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useRef, useState } from "react";
import { HiArrowRight } from "react-icons/hi";
import { HiBuildingStorefront, HiMiniEye } from "react-icons/hi2";
import OfferCard from "~/components/cards/OfferCard";
import LoadingLoader from "~/components/LoadingLoader";
import { StackItem } from "~/components/offer/StackItems";
import TextWithLinks from "~/components/offer/TextWithLinks";
import OfferHeaderWrapper from "~/components/wrappers/OfferHeaderWrapper";
import { getItemsConditionBlocks } from "~/payload/components/CustomSelectBlocksOfUse";
import { getItemsTermsOfUse } from "~/payload/components/CustomSelectTermsOfUse";
import { api } from "~/utils/api";
import { dottedPattern } from "~/utils/chakra-theme";
import ReactIcon from "~/utils/dynamicIcon";

export default function OfferPage() {
  const router = useRouter();

  const { id } = router.query as {
    id: string;
  };

  const { data: resultOffer, isLoading: isLoadingOffer } =
    api.offer.getById.useQuery(
      {
        id: parseInt(id),
      },
      { enabled: id !== undefined }
    );

  const {
    data: resultCoupon,
    isLoading: isLoadingCoupon,
    refetch: refetchCoupon,
  } = api.coupon.getOne.useQuery(
    {
      offer_id: parseInt(id as string),
    },
    { enabled: id !== undefined }
  );

  const { data: offer } = resultOffer || {};
  const { data: coupon } = resultCoupon || {};

  const { mutateAsync: mutateAsyncCouponToUser } =
    api.coupon.assignToUser.useMutation({
      onSuccess: () => refetchCoupon(),
    });

  const conditionsRef = useRef<HTMLUListElement>(null);
  const [isConditionsOpen, setIsConditionsOpen] = useState(false);
  const [displayBookmarkModal, setDisplayBookmarkModal] = useState(false);

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

  const handleValidateOffer = async (offerId: number) => {
    if (coupon) {
      router.push(`/dashboard/offer/${offerId}/coupon`);
    } else {
      await mutateAsyncCouponToUser({ offer_id: offerId });
    }
  };

  const handleBookmarkOfferToUser = async () => {
    return await mutateAsyncCouponToUser({
      offer_id: parseInt(id),
      isBookmarked: true,
    });
  };

  useEffect(() => {
    let timeoutIdToOpenBookmarkModal: NodeJS.Timeout;
    if (!coupon) {
      timeoutIdToOpenBookmarkModal = setTimeout(() => {
        setDisplayBookmarkModal(true);
      }, 3000);
    }
    return () => clearTimeout(timeoutIdToOpenBookmarkModal);
  }, []);

  if (isLoadingOffer || isLoadingCoupon || !offer)
    return (
      <OfferHeaderWrapper
        kind="offer"
        displayBookmarkModal={false}
        handleBookmarkOfferToUser={handleBookmarkOfferToUser}
      >
        <Center h="full">
          <LoadingLoader />
        </Center>
      </OfferHeaderWrapper>
    );

  return (
    <OfferHeaderWrapper
      kind="offer"
      partnerColor={offer.partner.color}
      headerComponent={<OfferCard offer={offer} variant="minimal" />}
      displayBookmarkModal={displayBookmarkModal}
      handleBookmarkOfferToUser={handleBookmarkOfferToUser}
    >
      <Flex flexDir="column">
        <Box mt={6} px={4} w="full">
          <Button
            fontSize={14}
            w="full"
            size="md"
            onClick={() => {
              push(["trackEvent", "Inactive", "J'active mon offre"]);
              handleValidateOffer(offer.id);
            }}
            leftIcon={<Icon as={HiMiniEye} w={5} h={5} />}
          >
            Voir mon code
          </Button>
        </Box>
        {offer.kind.startsWith("voucher") && (
          <>
            <VStack spacing={3} align="start">
              <HStack spacing={4}>
                <Icon as={HiBuildingStorefront} w={6} h={6} />
                <Text fontWeight="extrabold">Magasins participants</Text>
              </HStack>
              <Text fontWeight="medium">
                {offer.nbOfEligibleStores ?? 1} magasins {offer.partner.name}{" "}
                participants
              </Text>
              {offer.imageOfEligibleStores?.url &&
                offer.linkOfEligibleStores && (
                  <Link
                    as={NextLink}
                    href={offer.linkOfEligibleStores}
                    w="full"
                    target="_blank"
                  >
                    <Image
                      src={offer.imageOfEligibleStores.url}
                      alt={offer.imageOfEligibleStores.alt as string}
                      width={0}
                      height={114}
                      sizes="100vw"
                      style={{
                        width: "100%",
                        height: "114px",
                        borderRadius: "10px",
                        objectFit: "cover",
                      }}
                    />
                  </Link>
                )}
              {offer.linkOfEligibleStores && (
                <Link
                  as={NextLink}
                  href={offer.linkOfEligibleStores ?? ""}
                  target="_blank"
                >
                  <HStack align="center" borderBottom="1px solid black">
                    <Text fontWeight="medium">
                      Voir les magasins participants
                    </Text>
                    <Icon as={HiArrowRight} w={4} h={4} />
                  </HStack>
                </Link>
              )}
            </VStack>
            <Divider my={6} />
          </>
        )}
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
                <UnorderedList
                  fontWeight={500}
                  pl={3}
                  mt={3}
                  ref={conditionsRef}
                >
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
      </Flex>
    </OfferHeaderWrapper>
  );
}
