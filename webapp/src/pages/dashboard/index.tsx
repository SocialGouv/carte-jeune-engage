import {
  Box,
  Center,
  Flex,
  Grid,
  Heading,
  Icon,
  SimpleGrid,
  Text,
} from "@chakra-ui/react";
import Image from "next/image";
import Link from "next/link";
import { api } from "~/utils/api";
import InstallationBanner from "~/components/InstallationBanner";
import { FiMoreHorizontal } from "react-icons/fi";
import LoadingLoader from "~/components/LoadingLoader";
import OfferCard from "~/components/cards/OfferCard";

export default function Dashboard() {
  const { data: resultCategories, isLoading: isLoadingCategories } =
    api.category.getList.useQuery({
      page: 1,
      perPage: 3,
      sort: "createdAt",
    });

  const { data: resultOffers, isLoading: isLoadingOffers } =
    api.offer.getListOfAvailables.useQuery({
      page: 1,
      perPage: 50,
    });

  const { data: resultPartners, isLoading: isLoadingPartners } =
    api.partner.getList.useQuery({
      page: 1,
      perPage: 50,
    });

  const { data: categories } = resultCategories || {};
  const { data: offers } = resultOffers || {};
  const { data: partners } = resultPartners || {};

  if (isLoadingCategories || isLoadingOffers || isLoadingPartners) {
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
      <Box px={8}>
        <InstallationBanner />
        <Heading as="h2" fontSize="2xl">
          Quelles économies tu vas faire aujourd’hui ?
        </Heading>
        <SimpleGrid columns={4} mt={6} spacingX={4}>
          {categories?.map((category) => (
            <Link
              key={category.id}
              href={`/dashboard/category/${category.slug}`}
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
          <Link key="all" href="/dashboard/categories" passHref>
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
        <Heading as="h2" fontSize="2xl" mt={6}>
          Les réductions pour vous
        </Heading>
      </Box>
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
          <OfferCard key={offer.id} offer={offer} />
        ))}
      </Grid>
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
              />
            </Flex>
          ))}
        </SimpleGrid>
      </Box>
    </Box>
  );
}