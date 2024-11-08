import { Text, Tag, Center, Link, Box } from "@chakra-ui/react";
import { OfferIncluded } from "~/server/api/routers/offer";
import { BarcodeIcon } from "../icons/barcode";
import NextLink from "next/link";
import Image from "../ui/Image";

type ObizCardProps = {
  offer: OfferIncluded;
};

export const ObizCard = (props: ObizCardProps) => {
  const { offer } = props;

  return (
    <Link
      as={NextLink}
      href={`/dashboard/offer/${offer.source}/${offer.id}`}
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
        <Box
          borderRadius="2.5xl"
          border="1px solid"
          borderColor="bgGray"
          p={0.5}
        >
          <Image
            src={offer.partner.icon.url as string}
            alt={offer.partner.icon.alt as string}
            width={40}
            height={40}
            imageStyle={{
              width: "40px",
              height: "40px",
              borderRadius: "20px",
              objectFit: "cover",
              objectPosition: "center",
            }}
          />
        </Box>
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
