import {
  Box,
  Center,
  Divider,
  Flex,
  Grid,
  Heading,
  Icon,
  Link,
} from "@chakra-ui/react";
import jwt from "jsonwebtoken";
import { GetServerSideProps } from "next";
import NextImage from "next/image";
import NextLink from "next/link";
import { HiMiniTag } from "react-icons/hi2";
import OfferCard from "~/components/cards/OfferCard";
import { BarcodeIcon } from "~/components/icons/barcode";
import Jumbotron from "~/components/landing/Jumbotron";
import CategoriesList from "~/components/lists/CategoriesList";
import TagsList from "~/components/lists/TagsList";
import LoadingLoader from "~/components/LoadingLoader";
import SearchBar from "~/components/SearchBar";
import getPayloadClient from "~/payload/payloadClient";
import { ZWidgetToken } from "~/server/types";
import { api } from "~/utils/api";
import { decryptData } from "~/utils/tools";

export default function Widget() {
  const { data: resultOffersCje, isLoading: isLoadingOffersCje } =
    api.offer.getWidgetListOfAvailables.useQuery({
      page: 1,
      perPage: 100,
      shuffle: true,
      kinds: ["code", "code_space", "voucher", "voucher_pass"],
    });

  const { data: resultOffersObiz, isLoading: isLoadingOffersObiz } =
    api.offer.getWidgetListOfAvailables.useQuery({
      page: 1,
      perPage: 100,
      shuffle: true,
      kinds: ["code_obiz"],
    });

  const { data: offersCje } = resultOffersCje || {};
  const { data: offersObiz } = resultOffersObiz || {};

  const allOffers = [...(offersCje ?? []), ...(offersObiz ?? [])];

  if (isLoadingOffersCje || isLoadingOffersObiz) {
    return (
      <Box pt={12} px={8} h="full">
        <Center h="full" w="full">
          <LoadingLoader />
        </Center>
      </Box>
    );
  }

  return (
    <Flex
      direction={"column"}
      gap={4}
      pb={10}
      pt={[24, 0]}
      overflowX={"hidden"}
      position="relative"
    >
      {" "}
      <Flex
        gap={6}
        px={4}
        py={4}
        borderBottomWidth={1}
        borderBottomColor={"bgGray"}
        position={["fixed", "static"]}
        top={0}
        zIndex={99}
        bg="white"
        w="full"
      >
        <NextImage
          src="/images/cje-logo-blue.svg"
          alt="Logo CJE"
          width={48}
          height={25}
        />
        <Link
          as={NextLink}
          href="/widget/search"
          _hover={{ textDecoration: "none" }}
          passHref
          flexGrow={1}
        >
          <SearchBar
            search=""
            setSearch={() => ""}
            placeholder="Rechercher"
            small
          />
        </Link>
      </Flex>
      <Jumbotron />
      <Box mt={8}>
        <CategoriesList offers={allOffers} baseLink="/widget/category" />
      </Box>
      {offersObiz && offersObiz?.length > 0 && (
        <>
          <Heading as="h2" fontSize="2xl" fontWeight={800} mt={8} px={8}>
            Les <BarcodeIcon color="primary" w={7} h={7} mb={0.5} /> bons
            d'achat
          </Heading>
          <Grid
            templateColumns="repeat(auto-fit, 100%)"
            gridAutoFlow="column"
            gridAutoColumns="100%"
            mt={6}
            px={8}
            gap={2}
            pb={10}
            overflowX="auto"
            sx={{
              "::-webkit-scrollbar": {
                display: "none",
              },
            }}
          >
            {offersObiz?.map((offer) => (
              <OfferCard
                key={offer.id}
                offer={offer}
                matomoEvent={[
                  "Widget - Accueil",
                  "Pour vous",
                  `Offre - ${offer.partner.name} - ${offer.title} `,
                ]}
                fromWidget
              />
            ))}
          </Grid>
        </>
      )}
      {offersCje && offersCje?.length > 0 && (
        <>
          <Heading as="h2" fontSize="2xl" fontWeight={800} px={8}>
            Les{" "}
            <Icon
              as={HiMiniTag}
              color="primary"
              w={6}
              h={6}
              mr={1.5}
              mb={-0.5}
            />
            codes les plus utilisés
          </Heading>
          <Grid
            templateColumns="repeat(auto-fit, 100%)"
            gridAutoFlow="column"
            gridAutoColumns="100%"
            mt={6}
            px={8}
            gap={2}
            pb={14}
            overflowX="auto"
            sx={{
              "::-webkit-scrollbar": {
                display: "none",
              },
            }}
          >
            {offersCje?.map((offer) => (
              <OfferCard
                key={offer.id}
                offer={offer}
                matomoEvent={[
                  "Widget - Accueil",
                  "Pour vous",
                  `Offre - ${offer.partner.name} - ${offer.title} `,
                ]}
                fromWidget
              />
            ))}
          </Grid>
        </>
      )}
      <Box>
        <Divider mb={6} borderColor="cje-gray.100" />
        <TagsList offers={allOffers} baseLink="/widget/tag" />
      </Box>
    </Flex>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    let { widgetToken } = context.query;
    if (!widgetToken)
      widgetToken =
        context.req.cookies[process.env.NEXT_PUBLIC_WIDGET_TOKEN_NAME!];

    if (!widgetToken || typeof widgetToken !== "string") {
      return {
        redirect: {
          destination: "/",
          permanent: false,
        },
      };
    }

    const decoded = jwt.verify(widgetToken, process.env.WIDGET_SECRET_JWT!);
    const tokenObject = ZWidgetToken.parse(decoded);
    const cejUserId = decryptData(
      tokenObject.user_id,
      process.env.WIDGET_SECRET_DATA_ENCRYPTION!
    );

    const payload = await getPayloadClient({ seed: false });
    const users = await payload.find({
      collection: "users",
      where: {
        cej_id: { equals: cejUserId },
      },
    });

    if (!context.req.cookies[process.env.NEXT_PUBLIC_WIDGET_TOKEN_NAME!]) {
      context.res.setHeader(
        "Set-Cookie",
        `${process.env.NEXT_PUBLIC_WIDGET_TOKEN_NAME}=${widgetToken}; Expires=${new Date(
          new Date().getTime() + 7 * 24 * 60 * 60 * 1000
        ).toUTCString()}; Path=/; SameSite=None; Secure`
      );
    }

    if (!!users.docs.length) {
      return {
        redirect: {
          destination: `/widget/magiclink?widgetToken=${widgetToken}`,
          permanent: false,
        },
      };
    }
    return {
      props: {},
    };
  } catch (error) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }
};
