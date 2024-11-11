import { Text, Tag, Center, Link, Box, Flex } from "@chakra-ui/react";
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
        {offer.image && (
          <Image
            src={offer.image.url as string}
            alt={offer.image.alt as string}
            width={126}
            height={70}
            imageStyle={{
              width: "126px",
              height: "70px",
              transform: "translateY(40%)",
              marginTop: "-2rem",
              zIndex: 0,
            }}
          />
        )}
        <Flex
          alignItems="center"
          borderRadius="lg"
          border="1px solid"
          borderColor="bgGray"
          p={1}
          bg={"white"}
          overflow={"hidden"}
          zIndex={1}
          height="35px"
          maxWidth="80px"
        >
          <Image
            src={offer.partner.icon.url as string}
            alt={offer.partner.icon.alt as string}
            width={offer.partner.icon.width || 80}
            height={offer.partner.icon.height || 35}
            imageStyle={{
              width: "100%",
              maxHeight: "32px",
              borderRadius: "5px",
              objectFit: "cover",
              objectPosition: "center",
            }}
          />
        </Flex>
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
