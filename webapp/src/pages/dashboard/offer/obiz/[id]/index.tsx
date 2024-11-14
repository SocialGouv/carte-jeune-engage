import {
  Box,
  Button,
  Center,
  Divider,
  Flex,
  Heading,
  Link,
  ListItem,
  OrderedList,
  Tag,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { BarcodeIcon } from "~/components/icons/barcode";
import LoadingLoader from "~/components/LoadingLoader";
import ObizOrderProcessModal from "~/components/modals/ObizOrderProcessModal";
import { StackItem } from "~/components/offer/StackItems";
import BackButton from "~/components/ui/BackButton";
import Image from "~/components/ui/Image";
import PartnerImage from "~/components/ui/PartnerImage";
import { getItemsConditionBlocks } from "~/payload/components/CustomSelectBlocksOfUse";
import { getItemsTermsOfUse } from "~/payload/components/CustomSelectTermsOfUse";
import { api } from "~/utils/api";
import ReactIcon from "~/utils/dynamicIcon";
import { cleanHtml } from "~/utils/tools";

export default function OfferObizPage() {
  const router = useRouter();

  const {
    isOpen: isOpenOrderProcessModal,
    onOpen: onOpenOrderProcessModal,
    onClose: onCloseOrderProcessModal,
  } = useDisclosure();

  const [isOfferNbSeenMutated, setIsOfferNbSeenMutated] = useState(false);
  const [isDescriptionCollapsed, setIsDescriptionCollapsed] = useState(true);

  const { id } = router.query as {
    id: string;
  };

  const { mutateAsync: increaseNbSeen } =
    api.offer.increaseNbSeen.useMutation();

  const { data: resultOffer, isLoading: isLoadingOffer } =
    api.offer.getById.useQuery(
      { id: parseInt(id), source: "obiz" },
      { enabled: id !== undefined }
    );

  const { data: offer } = resultOffer || {};

  const itemsTermsOfUse = useMemo(() => {
    if (!offer) return [];
    return getItemsTermsOfUse(offer.kind);
  }, [offer]);

  const offerConditionBlocks = useMemo(() => {
    if (!offer) return [];
    return getItemsConditionBlocks(offer.kind) as StackItem[];
  }, [offer]);

  useEffect(() => {
    const mutateData = async () => {
      const { data } = await increaseNbSeen({ offer_id: parseInt(id) });
      setIsOfferNbSeenMutated(data);
    };

    if (!isOfferNbSeenMutated) mutateData();
  }, []);

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
    <>
      <Head>
        <meta name="theme-color" content={offer.partner.color} />
      </Head>
      <Flex direction={"column"} position="relative">
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
        <Flex direction={"column"} px={4} py={8} gap={8}>
          <Text textAlign={"center"} fontSize={"2xl"} fontWeight={700} mb={2}>
            {offer.partner.name}
          </Text>
          <Button
            colorScheme="blackBtn"
            mx={4}
            onClick={onOpenOrderProcessModal}
          >
            Acheter un bon
          </Button>
        </Flex>
        {offerConditionBlocks.length > 0 && (
          <Flex
            gap={3}
            w="full"
            h="max-content"
            py={1}
            px={4}
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
          </Flex>
        )}
        <Flex direction={"column"} px={4} pb={8} gap={8}>
          <Flex flexDir="column" mt={10}>
            <Text fontWeight="extrabold" fontSize={20}>
              Le{" "}
              <Tag fontWeight="extrabold" fontSize={20} py={1} rounded={"xl"}>
                <BarcodeIcon mr={2} w={6} h={6} /> Bon d'achat
              </Tag>
              <br />
              Comment ça marche ?
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
                  <Text dangerouslySetInnerHTML={{ __html: termOfUse.text }} />
                </ListItem>
              ))}
            </OrderedList>
          </Flex>
          {offer.description && (
            <>
              <Divider />
              <Flex direction={"column"} gap={2}>
                <Heading size="md" fontWeight={800}>
                  Description détaillée
                </Heading>
                <Text
                  noOfLines={isDescriptionCollapsed ? 4 : undefined}
                  dangerouslySetInnerHTML={{
                    __html: isDescriptionCollapsed
                      ? cleanHtml(offer.description)
                      : offer.description,
                  }}
                />
                {isDescriptionCollapsed && (
                  <Link
                    fontWeight={700}
                    textDecoration={"underline"}
                    onClick={() => setIsDescriptionCollapsed(false)}
                  >
                    Lire toute la description
                  </Link>
                )}
              </Flex>
            </>
          )}
          <Divider />
          <Text color="disabled" fontSize="sm">
            Pour plus d’informations sur cette offre veuillez consulter{" "}
            <Link
              href="https://obiz.fr/medias/upload/pdf/cgv_reducce-obiz.pdf"
              target="_blank"
              color="primary"
              textDecor={"underline"}
              fontWeight={700}
            >
              les conditions générales de vente et d’utilisation
            </Link>{" "}
            de notre partenaire.
          </Text>
        </Flex>
        <Flex
          position={"sticky"}
          bottom={0}
          p={4}
          pb={6}
          bg="white"
          borderTopWidth={1}
          borderTopColor={"gray.200"}
          zIndex={2}
        >
          <Button
            colorScheme="blackBtn"
            w="full"
            onClick={onOpenOrderProcessModal}
          >
            Acheter un bon
          </Button>
        </Flex>
        <ObizOrderProcessModal
          isOpen={isOpenOrderProcessModal}
          onClose={onCloseOrderProcessModal}
          offerId={parseInt(id)}
        />
      </Flex>
    </>
  );
}
