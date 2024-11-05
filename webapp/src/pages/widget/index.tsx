import { Box, Divider, Flex, Grid, Heading, Link } from "@chakra-ui/react";
import jwt from "jsonwebtoken";
import { GetServerSideProps } from "next";
import NextImage from "next/image";
import NextLink from "next/link";
import OfferCard from "~/components/cards/OfferCard";
import Jumbotron from "~/components/landing/Jumbotron";
import CategoriesList from "~/components/lists/CategoriesList";
import TagsList from "~/components/lists/TagsList";
import SearchBar from "~/components/SearchBar";
import getPayloadClient from "~/payload/payloadClient";
import { ZWidgetToken } from "~/server/types";
import { api } from "~/utils/api";
import { decryptData } from "~/utils/tools";

export default function Widget() {
  const { data: resultOffersOnline } =
    api.offer.getWidgetListOfAvailables.useQuery({
      page: 1,
      perPage: 10,
      sort: "partner.name",
      kinds: ["code", "code_obiz", "code_space"],
    });

  const { data: resultOffersInStore } =
    api.offer.getWidgetListOfAvailables.useQuery({
      page: 1,
      perPage: 10,
      sort: "partner.name",
      kinds: ["voucher", "voucher_pass"],
    });

  const { data: offersOnline } = resultOffersOnline || {};
  const { data: offersInStore } = resultOffersInStore || {};

  const allOffers = [...(offersOnline ?? []), ...(offersInStore ?? [])];

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
      {offersOnline && offersOnline?.length > 0 && (
        <>
          <Heading as="h2" fontSize="2xl" fontWeight={800} mt={8} px={8}>
            À utiliser en ligne
          </Heading>
          <Grid
            templateColumns="repeat(auto-fit, 100%)"
            gridAutoFlow="column"
            gridAutoColumns="100%"
            mt={6}
            px={8}
            gap={2}
            pb={8}
            overflowX="auto"
            sx={{
              "::-webkit-scrollbar": {
                display: "none",
              },
            }}
          >
            {offersOnline?.map((offer) => (
              <OfferCard
                key={offer.id}
                offer={offer}
                matomoEvent={[
                  "Accueil",
                  "Pour vous",
                  `Offre - ${offer.partner.name} - ${offer.title} `,
                ]}
                fromWidget
              />
            ))}
          </Grid>
        </>
      )}
      {offersInStore && offersInStore?.length > 0 && (
        <>
          <Heading as="h2" fontSize="2xl" fontWeight={800} px={8}>
            À utiliser en magasin
          </Heading>
          <Grid
            templateColumns="repeat(auto-fit, 100%)"
            gridAutoFlow="column"
            gridAutoColumns="100%"
            mt={4}
            px={8}
            gap={3}
            pb={8}
            overflowX="auto"
            sx={{
              "::-webkit-scrollbar": {
                display: "none",
              },
            }}
          >
            {offersInStore?.map((offer) => (
              <OfferCard
                key={offer.id}
                offer={offer}
                matomoEvent={[
                  "Accueil",
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
