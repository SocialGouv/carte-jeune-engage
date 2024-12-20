import { Text, Tag, Center, Link, Box, Flex } from "@chakra-ui/react";
import { OfferIncluded } from "~/server/api/routers/offer";
import { BarcodeIcon } from "../icons/barcode";
import NextLink from "next/link";
import Image from "../ui/Image";
import PartnerImage from "../ui/PartnerImage";

type ObizCardProps = {
  offer: OfferIncluded;
  fromWidget?: boolean;
};

export const ObizCard = (props: ObizCardProps) => {
  const { offer, fromWidget } = props;

  return (
    <Link
      as={NextLink}
      href={
        fromWidget
          ? `/widget/offer/${offer.id}`
          : `/dashboard/offer/${offer.source}/${offer.id}`
      }
      _hover={{ textDecoration: "none" }}
      passHref
    >
      <Center
        flexDir="column"
        bg="white"
        rounded="xl"
        shadow="default"
        overflow="hidden"
        gap={2}
        p={4}
      >
        {offer.image && (
          <Image
            src={offer.image.url as string}
            alt={offer.image.alt as string}
            width={115}
            height={70}
            imageStyle={{
              width: "115px",
              height: "70px",
              transform: "translateY(40%)",
              marginTop: "-2rem",
              zIndex: 0,
            }}
          />
        )}
        <PartnerImage partner={offer.partner} width={50} height={50} />
        <Tag fontWeight={700} w="fit-content" borderRadius="3xl">
          <BarcodeIcon mr={1} /> Bon d'achat
        </Tag>
        <Text fontSize={18} fontWeight={800}>
          {offer.title}
        </Text>
        <Text fontWeight={500} noOfLines={4} mt={1}>
          {offer.partner.name}
        </Text>
      </Center>
    </Link>
  );
};
