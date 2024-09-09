import {
  Box,
  Center,
  Flex,
  Grid,
  Heading,
  SimpleGrid,
  Text,
} from "@chakra-ui/react";
import { push } from "@socialgouv/matomo-next";
import Image from "next/image";
import Link from "next/link";
import InstallationBanner from "~/components/InstallationBanner";
import LoadingLoader from "~/components/LoadingLoader";
import SearchBar from "~/components/SearchBar";
import OfferCard from "~/components/cards/OfferCard";
import { CategoryIncluded } from "~/server/api/routers/category";
import { api } from "~/utils/api";

export default function Dashboard() {
  const { data: resultCategories, isLoading: isLoadingCategories } =
    api.category.getList.useQuery({
      page: 1,
      perPage: 100,
      sort: "createdAt",
    });

  const { data: resultQuickAccess, isLoading: isLoadingQuickAccess } =
    api.globals.quickAccessGetAll.useQuery();

  const { data: resultOffersOnline, isLoading: isLoadingOffersOnline } =
    api.offer.getListOfAvailables.useQuery({
      page: 1,
      perPage: 10,
      sort: "partner.name",
      kinds: ["code", "code_space"],
    });

  const { data: resultOffersInStore, isLoading: isLoadingOffersInStore } =
    api.offer.getListOfAvailables.useQuery({
      page: 1,
      perPage: 10,
      sort: "partner.name",
      kinds: ["voucher", "voucher_pass"],
    });

  const { data: resultPartners, isLoading: isLoadingPartners } =
    api.partner.getList.useQuery({
      page: 1,
      perPage: 8,
      stared: true,
      sort: "name",
    });

  const { data: categories } = resultCategories || {};
  const { data: quickAccessPartners } = resultQuickAccess || {};
  const { data: offersOnline } = resultOffersOnline || {};
  const { data: offersInStore } = resultOffersInStore || {};
  const { data: partners } = resultPartners || {};

  const firstCategoryRow = categories?.slice(
    0,
    Math.ceil((categories?.length || 0) / 2)
  );
  const secondCategoryRow = categories?.slice(
    Math.ceil((categories?.length || 0) / 2)
  );

  const renderCategory = (category: CategoryIncluded) => {
    const associatedOffers = [...(offersOnline || []), ...(offersInStore || [])]
      .filter((offer) => offer.category.id === category.id)
      .slice(0, 6);

    let backgroundColor;
    if (associatedOffers) {
      backgroundColor = associatedOffers[0]?.partner?.color || "#FECB24";
    }

    return (
      <Link
        key={category.id}
        href={`/dashboard/category/${category.slug}`}
        onClick={() => {
          push(["trackEvent", "Accueil", "Catégories - " + category.label]);
        }}
        passHref
      >
        <Flex
          justifyContent="flex-start"
          flexDir="column"
          alignItems="center"
          bgColor={backgroundColor}
          borderRadius="20px"
          p={4}
          minW="160px"
          maxW="160px"
          minH="196px"
          height="100%"
        >
          <Image
            src={category.icon.url as string}
            alt={category.icon.alt as string}
            width={40}
            height={24}
          />
          <Text
            wordBreak="break-word"
            whiteSpace="normal"
            fontSize="md"
            textAlign="center"
            fontWeight="extrabold"
            mb={5}
            noOfLines={2}
          >
            {category.label}
          </Text>
          <Grid templateColumns="repeat(3, 1fr)" gridColumnGap={2}>
            {associatedOffers?.map((offer) => (
              <Box
                key={offer.id}
                borderRadius="50%"
                overflow="hidden"
                width="40px"
                height="40px"
              >
                <Image
                  src={offer.partner.icon.url as string}
                  alt={offer.partner.icon.alt as string}
                  width={40}
                  height={40}
                  objectFit="cover"
                />
              </Box>
            ))}
          </Grid>
        </Flex>
      </Link>
    );
  };

  if (
    isLoadingCategories ||
    isLoadingQuickAccess ||
    isLoadingOffersOnline ||
    isLoadingOffersInStore ||
    isLoadingPartners
  ) {
    return (
      <Box pt={12} px={8} h="full">
        <Center h="full" w="full">
          <LoadingLoader />
        </Center>
      </Box>
    );
  }

  return (
    <>
      <Box pt={12} pb={32}>
        <InstallationBanner
          ignoreUserOutcome={false}
          matomoEvent={["Accueil", "Obtenir l'application"]}
        />
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
          <SearchBar />
        </Box>
        <Flex
          overflowX="auto"
          whiteSpace="nowrap"
          flexWrap="nowrap"
          position="relative"
          sx={{
            "&::-webkit-scrollbar": {
              display: "none",
            },
          }}
          px={8}
        >
          <Flex direction="column" gap={4}>
            <Flex gap="10px" mb={2}>
              {firstCategoryRow?.map(renderCategory)}
            </Flex>
            <Flex gap="10px">{secondCategoryRow?.map(renderCategory)}</Flex>
          </Flex>
        </Flex>
        {/* {quickAccessPartners && quickAccessPartners?.length > 0 && (
          <Flex
            alignItems="center"
            mt={5}
            px={8}
            gap={4}
            overflowX="auto"
            sx={{
              "::-webkit-scrollbar": {
                display: "none",
              },
            }}
          >
            {quickAccessPartners?.map((quickAccess) => (
              <Link
                key={quickAccess.id}
                href={`/dashboard/offer/${quickAccess.offer.id}`}
                onClick={() => {
                  push([
                    "trackEvent",
                    "Accueil",
                    `Accès rapide - Offre - ${quickAccess.offer.partner.name} - ${quickAccess.offer.title}`,
                  ]);
                }}
                passHref
              >
                <Box
                  bgColor="white"
                  borderRadius="full"
                  border="2px solid #EDEDED"
                >
                  <Flex
                    justifyContent="center"
                    alignItems="center"
                    borderRadius="full"
                    border="3px solid"
                    borderColor="#F7F8FA"
                    w={65}
                    h={65}
                  >
                    <Image
                      src={quickAccess.partner.icon.url as string}
                      alt={quickAccess.partner.icon.alt as string}
                      width={45}
                      height={45}
                    />
                  </Flex>
                </Box>
              </Link>
            ))}
          </Flex>
        )} */}
        {offersOnline && offersOnline?.length > 0 && (
          <>
            <Heading as="h2" fontSize="2xl" fontWeight={800} mt={8} px={8}>
              À utiliser en ligne
            </Heading>
            <Grid
              templateColumns="repeat(auto-fit, minmax(285px, 1fr))"
              gridAutoFlow="column"
              gridAutoColumns="minmax(285px, 1fr)"
              mt={6}
              px={8}
              gap={4}
              pb={2}
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
            <Heading as="h2" fontSize="2xl" px={8}>
              À utiliser en magasin
            </Heading>
            <Grid
              templateColumns="repeat(auto-fit, minmax(285px, 1fr))"
              gridAutoFlow="column"
              gridAutoColumns="minmax(285px, 1fr)"
              mt={4}
              px={8}
              gap={4}
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
                />
              ))}
            </Grid>
          </>
        )}
        {/* <Box px={8}>
          <Heading as="h2" fontSize="2xl" mt={6}>
            Nos partenaires
          </Heading>
          <SimpleGrid columns={4} gap={4} mt={5}>
            {partners?.map((partner) => (
              <Flex
                key={partner.id}
                flexDir="column"
                alignItems="center"
                justifyContent="center"
                borderRadius="xl"
                bgColor="white"
                p={2}
              >
                <Image
                  src={partner.icon.url as string}
                  alt={partner.icon.alt as string}
                  width={45}
                  height={45}
                  unoptimized
                />
              </Flex>
            ))}
          </SimpleGrid>
        </Box> */}
      </Box>
    </>
  );
}
