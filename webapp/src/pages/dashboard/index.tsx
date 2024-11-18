import {
  Box,
  Center,
  Divider,
  Grid,
  Heading,
  Icon,
  Link,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { HiMiniTag } from "react-icons/hi2";
import InstallationBanner from "~/components/InstallationBanner";
import LoadingLoader from "~/components/LoadingLoader";
import SearchBar from "~/components/SearchBar";
import OfferCard from "~/components/cards/OfferCard";
import { BarcodeIcon } from "~/components/icons/barcode";
import CategoriesList from "~/components/lists/CategoriesList";
import TagsList from "~/components/lists/TagsList";
import { api } from "~/utils/api";

export default function Dashboard() {
  const { data: resultOffersCje, isLoading: isLoadingOffersCje } =
    api.offer.getListOfAvailables.useQuery({
      page: 1,
      perPage: 100,
      shuffle: false,
      kinds: ["code", "code_space", "voucher", "voucher_pass"],
    });

  const { data: resultOffersObiz, isLoading: isLoadingOffersObiz } =
    api.offer.getListOfAvailables.useQuery({
      page: 1,
      perPage: 100,
      shuffle: false,
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
      {offersObiz && offersObiz?.length > 0 && (
        <>
          <Heading as="h2" fontSize="2xl" fontWeight={800} px={8} mt={8}>
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
                  "Accueil",
                  "Pour vous",
                  `Offre - ${offer.partner.name} - ${offer.title} `,
                ]}
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
