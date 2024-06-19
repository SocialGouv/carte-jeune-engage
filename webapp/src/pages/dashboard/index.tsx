import {
  Box,
  Button,
  Center,
  Flex,
  Grid,
  Heading,
  Icon,
  IconButton,
  SimpleGrid,
  Text,
} from "@chakra-ui/react";
import { push } from "@socialgouv/matomo-next";
import Image from "next/image";
import Link from "next/link";
import { FiMoreHorizontal } from "react-icons/fi";
import { HiCog6Tooth } from "react-icons/hi2";
import InstallationBanner from "~/components/InstallationBanner";
import LoadingLoader from "~/components/LoadingLoader";
import OfferCard from "~/components/cards/OfferCard";
import { PassIcon } from "~/components/icons/pass";
import { api } from "~/utils/api";

export default function Dashboard() {
  const { data: resultNewCategory, isLoading: isLoadingNewCategory } =
    api.globals.getNewCategory.useQuery();

  const { data: resultCategories, isLoading: isLoadingCategories } =
    api.category.getList.useQuery({
      page: 1,
      perPage: 2,
      sort: "createdAt",
    });

  const { data: resultQuickAccess, isLoading: isLoadingQuickAccess } =
    api.globals.quickAccessGetAll.useQuery();

  const { data: resultOffers, isLoading: isLoadingOffers } =
    api.offer.getListOfAvailables.useQuery({
      page: 1,
      perPage: 50,
      sort: "partner.name",
      matchPreferences: true,
    });

  const { data: resultPartners, isLoading: isLoadingPartners } =
    api.partner.getList.useQuery({
      page: 1,
      perPage: 8,
      stared: true,
      sort: "name",
    });

  const { data: newCategory } = resultNewCategory || {};
  const { data: categories } = resultCategories || {};
  const { data: quickAccessPartners } = resultQuickAccess || {};
  const { data: offers } = resultOffers || {};
  const { data: partners } = resultPartners || {};

  if (
    isLoadingCategories ||
    isLoadingQuickAccess ||
    isLoadingOffers ||
    isLoadingPartners ||
    isLoadingNewCategory ||
    !newCategory
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
        <Box px={8}>
          <Flex justifyContent="space-between" mb={6}>
            <Link href="/dashboard/account/card" passHref>
              <IconButton
                colorScheme="whiteBtn"
                onClick={() => push(["trackEvent", "Profil", "Ma carte CJE"])}
                size="md"
                icon={<PassIcon color="black" w={5} h={6} />}
                aria-label="Carte CJE"
              />
            </Link>
            <Link href="/dashboard/account" passHref>
              <IconButton
                colorScheme="whiteBtn"
                onClick={() => push(["trackEvent", "Navigation", "Profil"])}
                size="md"
                icon={<Icon as={HiCog6Tooth} color="black" w={6} h={6} />}
                aria-label="Page de profil"
              />
            </Link>
          </Flex>
          <InstallationBanner
            ignoreUserOutcome={false}
            matomoEvent={["Accueil", "Obtenir l'application"]}
          />
          <Heading as="h2" fontSize="2xl" fontWeight="extrabold">
            Quelles économies allez-vous faire aujourd’hui ?
          </Heading>
          <SimpleGrid columns={4} mt={6} spacingX={4}>
            {[newCategory, ...(categories || [])]?.map((category) => (
              <Link
                key={category.id}
                href={`/dashboard/category/${category.slug}`}
                onClick={() => {
                  push([
                    "trackEvent",
                    "Accueil",
                    "Catégories - " + category.label,
                  ]);
                }}
                passHref
              >
                <Flex
                  justifyContent="center"
                  alignItems="center"
                  bgColor="white"
                  borderRadius="xl"
                  p={2}
                >
                  <Image
                    src={category.icon.url as string}
                    alt={category.icon.alt as string}
                    width={45}
                    height={45}
                  />
                </Flex>
                <Text
                  pt={1.5}
                  fontSize="xs"
                  textAlign="center"
                  fontWeight="bold"
                  bgColor="bgWhite"
                  w="full"
                >
                  {category.label}
                </Text>
              </Link>
            ))}
            <Link
              key="all"
              href="/dashboard/categories"
              passHref
              onClick={() => {
                push(["trackEvent", "Accueil", `Toutes les catégories`]);
              }}
            >
              <Flex
                justifyContent="center"
                alignItems="center"
                bgColor="white"
                borderRadius="xl"
                p={2}
              >
                <Flex width={45} height={45}>
                  <Icon as={FiMoreHorizontal} width={10} height={10} m="auto" />
                </Flex>
              </Flex>
              <Text
                pt={1.5}
                fontSize="xs"
                textAlign="center"
                fontWeight="bold"
                bgColor="bgWhite"
                w="full"
              >
                Tout voir
              </Text>
            </Link>
          </SimpleGrid>
          {quickAccessPartners && quickAccessPartners?.length > 0 && (
            <Heading as="h2" fontSize="2xl" mt={6}>
              Accès rapides
            </Heading>
          )}
        </Box>
        {quickAccessPartners && quickAccessPartners?.length > 0 && (
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
        )}
        {offers && offers?.length > 0 && (
          <>
            <Heading as="h2" fontSize="2xl" mt={6} px={8}>
              Les réductions pour vous
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
              {offers?.map((offer) => (
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
        </Box>
      </Box>
    </>
  );
}
