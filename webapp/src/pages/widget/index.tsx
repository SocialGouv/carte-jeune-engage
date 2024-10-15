import { Box, Divider, Flex, Grid, Heading } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Jumbotron from "~/components/landing/Jumbotron";
import { api } from "~/utils/api";
import Cookies from "js-cookie";
import { GetServerSideProps } from "next";
import jwt from "jsonwebtoken";
import CategoriesList from "~/components/lists/CategoriesList";
import OfferCard from "~/components/cards/OfferCard";
import TagsList from "~/components/lists/TagsList";

type WidgetProps = {
  initialToken: string;
};

export default function Widget({ initialToken }: WidgetProps) {
  const router = useRouter();
  const [isCookieSet, setIsCookieSet] = useState<boolean>(false);

  useEffect(() => {
    if (initialToken) {
      Cookies.set(process.env.NEXT_PUBLIC_WIDGET_TOKEN_NAME!, initialToken, {
        expires: 7,
        path: "/",
        secure: true,
        sameSite: "none",
      });
      setIsCookieSet(true);
    }
  }, [router.query, router]);

  useEffect(() => {
    if (isCookieSet) {
      const newQuery = { ...router.query };
      delete newQuery.widgetToken;
      router.replace(
        {
          pathname: router.pathname,
          query: newQuery,
        },
        undefined,
        { shallow: true }
      );
    }
  }, [isCookieSet]);

  const { data: resultOffersOnline, isLoading: isLoadingOffersOnline } =
    api.offer.getWidgetListOfAvailables.useQuery(
      {
        page: 1,
        perPage: 10,
        sort: "partner.name",
        kinds: ["code", "code_space"],
      },
      {
        enabled: isCookieSet,
      }
    );

  const { data: resultOffersInStore, isLoading: isLoadingOffersInStore } =
    api.offer.getWidgetListOfAvailables.useQuery(
      {
        page: 1,
        perPage: 10,
        sort: "partner.name",
        kinds: ["voucher", "voucher_pass"],
      },
      {
        enabled: isCookieSet,
      }
    );

  const { data: offersOnline } = resultOffersOnline || {};
  const { data: offersInStore } = resultOffersInStore || {};

  const allOffers = [...(offersOnline ?? []), ...(offersInStore ?? [])];

  return (
    <Flex direction={"column"} gap={4} py={10} overflowX={"hidden"}>
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
            pb={4}
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
            pb={2}
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
      <Box px={8}>
        <Divider mb={6} borderColor="cje-gray.100" />
        <TagsList baseLink="/widget/tag" />
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

    jwt.verify(widgetToken, process.env.WIDGET_SECRET_JWT!);

    return {
      props: {
        initialToken: widgetToken,
      },
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
