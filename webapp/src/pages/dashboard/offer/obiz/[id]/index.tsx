import {
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
import { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { BarcodeIcon } from "~/components/icons/barcode";
import LoadingLoader from "~/components/LoadingLoader";
import ObizOrderProcessModal from "~/components/modals/ObizOrderProcessModal";
import ConditionBlocksSection from "~/components/offer/ConditionBlocksSection";
import BackButton from "~/components/ui/BackButton";
import Image from "~/components/ui/Image";
import PartnerImage from "~/components/ui/PartnerImage";
import { getItemsTermsOfUse } from "~/payload/components/CustomSelectTermsOfUse";
import { api } from "~/utils/api";
import { cleanHtml } from "~/utils/tools";

type OfferObizPageProps = {
  offer_id: string;
};

export default function OfferObizPage({ offer_id }: OfferObizPageProps) {
  const router = useRouter();

  const {
    isOpen: isOpenOrderProcessModal,
    onOpen: onOpenOrderProcessModal,
    onClose: onCloseOrderProcessModal,
  } = useDisclosure();

  const [isDescriptionCollapsed, setIsDescriptionCollapsed] = useState(true);

  const { mutateAsync: increaseNbSeen } =
    api.offer.increaseNbSeen.useMutation();

  const { data: resultOffer, isLoading: isLoadingOffer } =
    api.offer.getById.useQuery({ id: parseInt(offer_id), source: "obiz" });

  const { data: offer } = resultOffer || {};

  const offerConditionBlocksSlugs = useMemo(() => {
    if (!offer) return [];
    return (
      offer.conditionBlocks?.map((conditionBlock) => conditionBlock.slug) ?? []
    );
  }, [offer]);

  const itemsTermsOfUse = useMemo(() => {
    if (!offer) return [];
    return getItemsTermsOfUse(offer.kind);
  }, [offer]);

  const onRedirectPayment = () => {
    onCloseOrderProcessModal();
  };

  useEffect(() => {
    const mutateData = async () => {
      await increaseNbSeen({ offer_id: parseInt(offer_id) });
    };

    mutateData();
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
        <ConditionBlocksSection
          offerConditionBlocksSlugs={offerConditionBlocksSlugs}
          offerSource={offer.source}
        />
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
          onRedirectPayment={onRedirectPayment}
          offerId={parseInt(offer_id)}
        />
      </Flex>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const offer_id = query.id;
  return {
    props: { offer_id },
  };
};
