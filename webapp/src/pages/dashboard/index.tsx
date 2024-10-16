import { Box, Center, Divider, Grid, Heading, Link } from "@chakra-ui/react";
import NextLink from "next/link";
import InstallationBanner from "~/components/InstallationBanner";
import LoadingLoader from "~/components/LoadingLoader";
import SearchBar from "~/components/SearchBar";
import OfferCard from "~/components/cards/OfferCard";
import CategoriesList from "~/components/lists/CategoriesList";
import TagsList from "~/components/lists/TagsList";
import { api } from "~/utils/api";

export default function Dashboard() {
  const { data: resultOffersOnline, isLoading: isLoadingOffersOnline } =
    api.offer.getListOfAvailables.useQuery({
      page: 1,
      perPage: 100,
      sort: "partner.name",
      kinds: ["code", "code_space"],
    });

  const { data: resultOffersInStore, isLoading: isLoadingOffersInStore } =
    api.offer.getListOfAvailables.useQuery({
      page: 1,
      perPage: 100,
      sort: "partner.name",
      kinds: ["voucher", "voucher_pass"],
    });

  const { data: offersOnline } = resultOffersOnline || {};
  const { data: offersInStore } = resultOffersInStore || {};

  const allOffers = [...(offersOnline ?? []), ...(offersInStore ?? [])];

  if (isLoadingOffersOnline || isLoadingOffersInStore) {
    return (
      <Box pt={12} px={8} h="full">
        <Center h="full" w="full">
          <LoadingLoader />
        </Center>
      </Box>
    );
  }

  return (
    <Box pt={12} pb={32}>
      <Box
        px={8}
        pb={4}
        borderBottomWidth={1}
        borderBottomColor="cje-gray.400"
        mb={6}
      >
        <Heading as="h2" fontSize="2xl" fontWeight="extrabold" mb={9}>
          Explorer
        </Heading>
        <Link
          as={NextLink}
          href="/dashboard/search"
          _hover={{ textDecoration: "none" }}
          passHref
        >
          <SearchBar search="" setSearch={() => ""} />
        </Link>
      </Box>
      <CategoriesList offers={allOffers} />
      <Box px={8} mt={6}>
        <InstallationBanner
          ignoreUserOutcome={false}
          matomoEvent={["Accueil", "Obtenir l'application"]}
        />
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
            pb={10}
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
            {offersInStore?.map((offer) => (
              <OfferCard
                key={offer.id}
                offer={offer}
                matomoEvent={[
                  "Accueil",
                  "Pour vous",
                  `Offre - ${offer.partner.name} - ${offer.title} `,
                ]}
              />
            ))}
          </Grid>
        </>
      )}
      <Box px={8}>
        <Divider borderColor="cje-gray.100" />
      </Box>
      <Box mt={8}>
        <TagsList offers={allOffers} />
      </Box>
    </Box>
  );
}
