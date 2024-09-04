import { Flex, Text } from "@chakra-ui/react";
import Image from "next/image";
import Link from "next/link";
import { OfferIncluded } from "~/server/api/routers/offer";
import { dottedPattern } from "~/utils/chakra-theme";
import { OfferKindBadge } from "../OfferKindBadge";
import { push } from "@socialgouv/matomo-next";

type OfferCardProps = {
  offer: OfferIncluded;
  displayExpiryDate?: boolean;
  matomoEvent?: string[];
};

const OfferCard = ({
  offer,
  displayExpiryDate = false,
  matomoEvent = [],
}: OfferCardProps) => {
  return (
    <Link
      href={`/dashboard/offer/${offer.id}`}
      onClick={() => {
        if (!!matomoEvent.length) push(["trackEvent", ...matomoEvent]);
      }}
    >
      <Flex flexDir="column">
        <Flex
          bgColor={offer.partner.color}
          py={5}
          borderTopRadius={12}
          position="relative"
          justifyContent="center"
          alignItems="center"
          sx={{ ...dottedPattern("#ffffff") }}
        >
          <Flex alignItems="center" borderRadius="full" p={1} bgColor="white">
            <Image
              src={offer.partner.icon.url ?? ""}
              alt={offer.partner.icon.alt ?? ""}
              width={42}
              height={42}
              style={{
                borderRadius: "50%",
              }}
            />
          </Flex>
        </Flex>
        <Flex
          flexDir="column"
          p={3}
          bgColor="white"
          borderBottomRadius={8}
          gap={2}
          boxShadow="md"
        >
          <Text fontSize="sm" fontWeight="medium">
            {offer.partner.name}
          </Text>
          <Text fontWeight="bold" fontSize="sm" noOfLines={2} h="42px">
            {offer.title}
          </Text>
          <OfferKindBadge kind={offer.kind} variant="light" />
          {displayExpiryDate && (
            <Flex
              alignSelf="start"
              borderRadius="2xl"
              bgColor="bgWhite"
              py={2}
              px={3}
            >
              <Text fontSize="xs" fontWeight="medium">
                Expire le : {new Date(offer.validityTo).toLocaleDateString()}
              </Text>
            </Flex>
          )}
        </Flex>
      </Flex>
    </Link>
  );
};

export default OfferCard;
