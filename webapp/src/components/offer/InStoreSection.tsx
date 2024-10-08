import { Icon, Link, Text, Flex, Box } from "@chakra-ui/react";
import { HiBuildingStorefront, HiShoppingCart } from "react-icons/hi2";
import { HiArrowRight } from "react-icons/hi";
import { OfferIncluded } from "~/server/api/routers/offer";
import NextLink from "next/link";
import Image from "next/image";

type InStoreSectionProps = {
  offer: OfferIncluded;
  withoutBackground?: boolean;
  disabled?: boolean;
};

const InStoreSection = (props: InStoreSectionProps) => {
  const { offer, withoutBackground, disabled } = props;

  return (
    <Flex
      flexDir="column"
      gap={2}
      borderRadius="2.5xl"
      bg={!withoutBackground ? "bgGray" : "inherit"}
      p={!withoutBackground ? 4 : 0}
      opacity={disabled ? 0.6 : 1}
    >
      <Box position="relative">
        <Image
          src="/images/map-magasin.png"
          alt="Map du magasin avec le logo du partenaire"
          width={0}
          height={0}
          sizes="100vw"
          style={{ width: "100%", height: "142px" }}
        />
        <Image
          src={offer.partner.icon.url as string}
          alt={offer.partner.icon.alt as string}
          width={46}
          height={46}
          style={{
            position: "absolute",
            top: "35%",
            left: "43%",
          }}
        />
      </Box>
      <Link
        as={NextLink}
        href={offer.linkOfEligibleStores ?? ""}
        target="_blank"
        _hover={{ textDecoration: "none" }}
        onClick={(e) => {
          if (disabled) e.preventDefault();
        }}
      >
        <Flex alignItems="center" borderRadius="2.5xl" bgColor="white" p={6}>
          <Icon as={HiBuildingStorefront} w={5} h={5} mr={4} />
          <Text fontWeight={500}>Magasins participants</Text>
          <Icon as={HiArrowRight} w={4} h={4} ml="auto" />
        </Flex>
      </Link>
      <Flex alignItems="center" borderRadius="2.5xl" bgColor="white" p={6}>
        <Icon as={HiShoppingCart} w={5} h={5} mr={4} />
        <Text fontWeight={500}>Vérifier les produits inclus</Text>
        <Icon as={HiArrowRight} w={4} h={4} ml="auto" />
      </Flex>
    </Flex>
  );
};

export default InStoreSection;
