import {
  Box,
  Center,
  Divider,
  Flex,
  HStack,
  Icon,
  Text,
  UnorderedList,
  ListItem,
  OrderedList,
  Button,
  useDisclosure,
  CircularProgress,
} from "@chakra-ui/react";
import { push } from "@socialgouv/matomo-next";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useMemo, useRef, useState } from "react";
import { HiArrowRight } from "react-icons/hi";
import { HiMiniEye, HiOutlineClock } from "react-icons/hi2";
import CouponCard from "~/components/cards/CouponCard";
import OfferCard from "~/components/cards/OfferCard";
import LoadingLoader from "~/components/LoadingLoader";
import BaseModal from "~/components/modals/BaseModal";
import InStoreSection from "~/components/offer/InStoreSection";
import { StackItem } from "~/components/offer/StackItems";
import TextWithLinks from "~/components/offer/TextWithLinks";
import OfferHeaderWrapper from "~/components/wrappers/OfferHeaderWrapper";
import { getItemsConditionBlocks } from "~/payload/components/CustomSelectBlocksOfUse";
import { getItemsTermsOfUse } from "~/payload/components/CustomSelectTermsOfUse";
import { api } from "~/utils/api";
import { dottedPattern } from "~/utils/chakra-theme";
import ReactIcon from "~/utils/dynamicIcon";
import { isIOS } from "~/utils/tools";

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

  const [kind, setKind] = useState<"offer" | "coupon">("offer");
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
      setKind("coupon");
    } else {
      await mutateAsyncCouponToUser({ offer_id: offerId });
    }
  };

  const handleBookmarkOfferToUser = async () => {
    return await mutateAsyncCouponToUser({
      offer_id: parseInt(id),
    });
  };

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

  useEffect(() => {
    let timeoutIdToOpenBookmarkModal: NodeJS.Timeout;
    if (!isLoadingCoupon && !coupon) {
      timeoutIdToOpenBookmarkModal = setTimeout(() => {
        setDisplayBookmarkModal(true);
      }, 3000);
    }
    return () => clearTimeout(timeoutIdToOpenBookmarkModal);
  }, [isLoadingCoupon]);

  if (isLoadingOffer || isLoadingCoupon || !offer)
    return (
      <OfferHeaderWrapper
        kind="offer"
        setKind={setKind}
        displayBookmarkModal={false}
        handleBookmarkOfferToUser={handleBookmarkOfferToUser}
      >
        <Center h="full">
          <LoadingLoader />
        </Center>
      </OfferHeaderWrapper>
    );

  if (kind === "coupon" && coupon) {
    return (
      <OfferHeaderWrapper
        kind="coupon"
        setKind={setKind}
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
                      src={coupon.offer.partner.icon.url as string}
                      alt={coupon.offer.partner.icon.alt as string}
                      width={12}
                      height={12}
                    />
                  </Box>
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

  return (
    <OfferHeaderWrapper
      kind="offer"
      setKind={setKind}
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
