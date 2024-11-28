import {
  Box,
  Button,
  Divider,
  Flex,
  HStack,
  Icon,
  ListItem,
  OrderedList,
  Text,
  UnorderedList,
} from "@chakra-ui/react";
import { push } from "@socialgouv/matomo-next";
import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import {
  HiArrowPathRoundedSquare,
  HiBookmark,
  HiMiniEye,
  HiOutlineBookmark,
} from "react-icons/hi2";
import { getItemsTermsOfUse } from "~/payload/components/CustomSelectTermsOfUse";
import { CouponIncluded } from "~/server/api/routers/coupon";
import { OfferIncluded } from "~/server/api/routers/offer";
import { dottedPattern } from "~/utils/chakra-theme";
import InStoreSection from "../InStoreSection";
import TextWithLinks from "../TextWithLinks";
import ConditionBlocksSection from "../ConditionBlocksSection";
import { getItemsConditionBlocks } from "~/payload/components/CustomSelectBlocksOfUse";
import { formatMinutesDisplay } from "~/utils/tools";

type OfferContentProps = {
  offer: OfferIncluded;
  canTakeCoupon: boolean;
  cooldownInMinutes: number | null;
  disabled: boolean;
  handleValidateOffer: (
    offerId: number,
    displayCoupon?: boolean
  ) => Promise<void>;
  isLoadingValidateOffer: boolean;
};

const OfferContent = (props: OfferContentProps) => {
  const {
    offer,
    canTakeCoupon,
    cooldownInMinutes,
    disabled,
    handleValidateOffer,
    isLoadingValidateOffer,
  } = props;

  const conditionsRef = useRef<HTMLUListElement>(null);
  const [isConditionsOpen, setIsConditionsOpen] = useState(false);

  const offerConditionBlocks = useMemo(() => {
    if (!offer) return [];
    return getItemsConditionBlocks(offer.source)
      .filter((conditionBlock) =>
        offer.conditionBlocks
          ?.map((cb) => cb.slug)
          .includes(conditionBlock.slug)
      )
      .map((conditionBlock) => ({
        ...conditionBlock,
        isCrossed:
          offer.conditionBlocks?.find((cb) => cb.slug === conditionBlock.slug)
            ?.isCrossed ?? false,
      }));
  }, [offer]);

  const itemsTermsOfUse = useMemo(() => {
    if (!offer) return [];
    return getItemsTermsOfUse(offer.kind);
  }, [offer]);

  const offerConditions = useMemo(() => {
    if (!offer) return [];
    if (!isConditionsOpen) return offer.conditions?.slice(0, 2) ?? [];
    return offer.conditions ?? [];
  }, [offer, isConditionsOpen]);

  return (
    <Flex flexDir="column">
      <Box mt={6} px={4} w="full">
        {disabled ? (
          <Box
            w="full"
            color="success"
            bg="successLight"
            rounded={"2xl"}
            py={6}
            textAlign={"center"}
            fontWeight="bold"
          >
            Offre déjà utilisée
          </Box>
        ) : (
          <Button
            fontSize={14}
            w="full"
            colorScheme={cooldownInMinutes ? "gray" : "blackBtn"}
            isLoading={isLoadingValidateOffer}
            onClick={() => {
              push(["trackEvent", "Inactive", "J'active mon offre"]);
              handleValidateOffer(offer.id);
            }}
            leftIcon={
              cooldownInMinutes ? (
                <Icon as={HiArrowPathRoundedSquare} w={5} h={5} />
              ) : (
                <Icon as={HiMiniEye} w={5} h={5} />
              )
            }
            style={{
              pointerEvents: cooldownInMinutes ? "none" : "auto",
            }}
          >
            {cooldownInMinutes
              ? `Prochain code dans ${formatMinutesDisplay(cooldownInMinutes)}`
              : "Voir mon code"}
          </Button>
        )}
      </Box>
      {offerConditionBlocks.length > 0 && (
        <Box mt={8}>
          <ConditionBlocksSection
            offerConditionBlocks={offerConditionBlocks}
            offerSource={offer.source}
          />
        </Box>
      )}
      {offer.kind.startsWith("voucher") && (
        <Box mt={8} px={4} w="full">
          <InStoreSection offer={offer} disabled={disabled} />
        </Box>
      )}
      <Flex flexDir="column" px={4} opacity={disabled ? 0.6 : 1}>
        {itemsTermsOfUse.length > 0 && (
          <HStack spacing={4}>
            <Flex flexDir="column" gap={3} mt={8}>
              <Text fontWeight="extrabold" fontSize={20}>
                Comment utiliser l'offre ?
              </Text>
              <OrderedList
                fontWeight={500}
                styleType="none"
                ml={2}
                pr={4}
                css={{
                  counterReset: "item",
                }}
              >
                {itemsTermsOfUse.map((termOfUse) => (
                  <ListItem
                    key={termOfUse.text}
                    mb={2}
                    mt={4}
                    display="flex"
                    alignItems="center"
                    css={{
                      counterIncrement: "item",
                      "&::before": {
                        content: 'counter(item) "."',
                        marginRight: "1rem",
                        fontWeight: 900,
                        display: "inline-block",
                      },
                    }}
                  >
                    <Text
                      dangerouslySetInnerHTML={{ __html: termOfUse.text }}
                    />
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
      {!disabled && !cooldownInMinutes && (
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
            borderColor={canTakeCoupon ? "cje-gray.100" : "transparent"}
            color={canTakeCoupon ? "blackLight" : "white"}
            colorScheme={canTakeCoupon ? "inherit" : "primaryShades"}
            isDisabled={!canTakeCoupon}
            isLoading={canTakeCoupon && isLoadingValidateOffer}
            onClick={() => {
              if (canTakeCoupon) {
                handleValidateOffer(offer.id, false);
              }
            }}
            leftIcon={
              <Icon
                as={canTakeCoupon ? HiOutlineBookmark : HiBookmark}
                w={5}
                h={5}
              />
            }
          >
            {canTakeCoupon ? "Enregistrer" : "Enregistré"}
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
      )}
    </Flex>
  );
};
export default OfferContent;
