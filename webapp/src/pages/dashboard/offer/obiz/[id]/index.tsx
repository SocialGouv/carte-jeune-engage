import { Button, Center, Flex, Icon, Tag, Text } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { BarcodeIcon } from "~/components/icons/barcode";
import LoadingLoader from "~/components/LoadingLoader";
import BackButton from "~/components/ui/BackButton";
import Image from "~/components/ui/Image";
import { api } from "~/utils/api";

export default function OfferObizPage() {
  const router = useRouter();

  const { id } = router.query as {
    id: string;
  };

  const { data: resultOffer, isLoading: isLoadingOffer } =
    api.offer.getById.useQuery(
      { id: parseInt(id), source: "obiz" },
      { enabled: id !== undefined }
    );

  const { data: offer } = resultOffer || {};

  if (isLoadingOffer || !router.isReady) {
    return (
      <Center h="full">
        <LoadingLoader />
      </Center>
    );
  }

  if (!offer) {
    router.replace("/dashboard");
    return;
  }

  return (
    <Flex direction={"column"}>
      <Flex
        bg={offer.partner.color}
        px={8}
        pt={12}
        pb={10}
        direction={"column"}
        gap={6}
      >
        <BackButton />
        <Flex
          alignItems={"center"}
          direction={"column"}
          bg="white"
          py={8}
          px={4}
          rounded={"2xl"}
          gap={3}
          mx={4}
        >
          <Flex direction={"column"} mb={2} alignItems={"center"} gap={2}>
            <Image
              src={offer.partner.icon.url || ""}
              width={60}
              height={offer.partner.icon.height || 50}
              alt={`Logo ${offer.partner.name}`}
            />
            <Text fontWeight={700} fontSize={"xl"}>
              {offer.partner.name}
            </Text>
          </Flex>
          <Tag fontWeight={700}>
            <BarcodeIcon mr={1} /> Bon d'achat
          </Tag>
          <Text fontWeight={800} fontSize="3xl" textAlign={"center"}>
            {offer.title}
          </Text>
        </Flex>
      </Flex>

      <Flex direction={"column"} p={8} gap={4}>
        <Text textAlign={"center"} fontSize={"2xl"} fontWeight={700}>
          {offer.partner.name}
        </Text>
        <Button colorScheme="blackBtn" mt={4}>
          Acheter un bon
        </Button>
      </Flex>
    </Flex>
  );
}
