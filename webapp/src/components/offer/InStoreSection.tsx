import { Icon, Link, Text, Flex } from "@chakra-ui/react";
import { Image } from "@chakra-ui/next-js";
import { HiBuildingStorefront, HiShoppingCart } from "react-icons/hi2";
import { HiArrowRight } from "react-icons/hi";
import { OfferIncluded } from "~/server/api/routers/offer";
import NextLink from "next/link";
import NextImage from "next/image";

type InStoreSectionProps = {
  offer: OfferIncluded;
  withoutBackground?: boolean;
};

const InStoreSection = (props: InStoreSectionProps) => {
  const { offer, withoutBackground } = props;

  return (
    <Flex
      flexDir="column"
      gap={2}
      borderRadius="2.5xl"
      bg={!withoutBackground ? "bgGray" : "inherit"}
      p={!withoutBackground ? 4 : 0}
    >
      {offer.imageOfEligibleStores?.url && offer.linkOfEligibleStores && (
        <Link
          as={NextLink}
          href={offer.linkOfEligibleStores}
          w="full"
          target="_blank"
        >
          <Image
            as={NextImage}
            src={offer.imageOfEligibleStores.url}
            alt={offer.imageOfEligibleStores.alt as string}
            width={335}
            height={142}
          />
        </Link>
      )}
      <Flex alignItems="center" borderRadius="2.5xl" bgColor="white" p={6}>
        <Icon as={HiBuildingStorefront} w={5} h={5} mr={4} />
        <Text fontWeight={500}>Magasins participants</Text>
        <Icon as={HiArrowRight} w={4} h={4} ml="auto" />
      </Flex>
      <Flex alignItems="center" borderRadius="2.5xl" bgColor="white" p={6}>
        <Icon as={HiShoppingCart} w={5} h={5} mr={4} />
        <Text fontWeight={500}>Vérifier les produits inclus</Text>
        <Icon as={HiArrowRight} w={4} h={4} ml="auto" />
      </Flex>
    </Flex>
  );
};

export default InStoreSection;
