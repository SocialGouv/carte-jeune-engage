import {
  Box,
  Center,
  Divider,
  Flex,
  Grid,
  Heading,
  Icon,
  Text,
} from "@chakra-ui/react";
import { mostReadable } from "@ctrl/tinycolor";
import { push } from "@socialgouv/matomo-next";
import Image from "next/image";
import Link from "next/link";
import { HiChevronRight } from "react-icons/hi2";
import InstallationBanner from "~/components/InstallationBanner";
import LoadingLoader from "~/components/LoadingLoader";
import SearchBar from "~/components/SearchBar";
import OfferCard from "~/components/cards/OfferCard";
import { CategoryIncluded } from "~/server/api/routers/category";
import { OfferIncluded } from "~/server/api/routers/offer";
import { api } from "~/utils/api";
import { paginateArray } from "~/utils/tools";

type CategoryWithOffers = CategoryIncluded & { offers: OfferIncluded[] };

export default function Dashboard() {
  const { data: resultCategories, isLoading: isLoadingCategories } =
    api.globals.categoriesListOrdered.useQuery();

  const { data: resultTags, isLoading: isLoadingTags } =
    api.globals.tagsListOrdered.useQuery();

  const {
    data: resultOffersOnline,
    isLoading: isLoadingOffersOnline,
    refetch: refetchOffersOnline,
  } = api.offer.getListOfAvailables.useQuery({
    page: 1,
    perPage: 10,
    sort: "partner.name",
    kinds: ["code", "code_space"],
  });

  const {
    data: resultOffersInStore,
    isLoading: isLoadingOffersInStore,
    refetch: refetchOfferInStore,
  } = api.offer.getListOfAvailables.useQuery({
    page: 1,
    perPage: 10,
    sort: "partner.name",
    kinds: ["voucher", "voucher_pass"],
  });

  const { mutateAsync: mutateAsyncCouponToUser } =
    api.coupon.assignToUser.useMutation({
      onSuccess: () => {
        refetchOffersOnline();
        refetchOfferInStore();
      },
    });
  const { mutateAsync: mutateAsyncRemoveCouponFromUser } =
    api.coupon.unassignFromUser.useMutation({
      onSuccess: () => {
        refetchOffersOnline();
        refetchOfferInStore();
      },
    });

  const { data: categories } = resultCategories || {};
  const { data: tags } = resultTags || {};
  const { data: offersOnline } = resultOffersOnline || {};
  const { data: offersInStore } = resultOffersInStore || {};

  const allOffers = [...(offersOnline ?? []), ...(offersInStore ?? [])];
  const paginatedTags = paginateArray(tags ?? [], 6);

  const formatedCategories = [] as CategoryWithOffers[];
  (categories || []).forEach((category) => {
    if (allOffers.some((offer) => offer.category.id === category.id)) {
      formatedCategories.push({
        ...category,
        offers: allOffers.filter((offer) => offer.category.id === category.id),
      });
    }
  });

  const handleAssignUserToCoupon = async (
    offerId: number,
    isAssignedToUser: boolean
  ) => {
    if (!isAssignedToUser) {
      await mutateAsyncCouponToUser({ offer_id: offerId, isBookmarked: true });
    } else {
      const currentUserCoupon = allOffers.find(
        (offer) => offer.id === offerId
      )?.userCoupon;
      if (!currentUserCoupon) return;
      await mutateAsyncRemoveCouponFromUser({
        coupon_id: currentUserCoupon.id,
      });
    }
  };

  const firstCategoryRow = formatedCategories.filter(
    (_, index) => index % 2 === 0
  );
  const secondCategoryRow = formatedCategories.filter(
    (_, index) => index % 2 !== 0
  );

  const renderCategory = (category: CategoryWithOffers) => {
    const bgColor = category.color ?? "cje-gray.100";
    const textColor = mostReadable(bgColor, ["black", "white"])?.toHexString();

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
          bgColor={bgColor}
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
            color={textColor}
            mb={5}
            noOfLines={2}
          >
            {category.label}
          </Text>
          <Grid templateColumns="repeat(3, 1fr)" gridColumnGap={2}>
            {category.offers?.map((offer) => (
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
    isLoadingOffersOnline ||
    isLoadingOffersInStore ||
    isLoadingTags
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
          <Flex gap={4}>{firstCategoryRow.map(renderCategory)}</Flex>
          <Flex gap={4}>{secondCategoryRow.map(renderCategory)}</Flex>
        </Flex>
      </Flex>
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
                isBookmarked={!!offer.userCoupon}
                handleBookmarkOffer={handleAssignUserToCoupon}
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
                isBookmarked={!!offer.userCoupon}
                handleBookmarkOffer={handleAssignUserToCoupon}
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
      {tags && tags.length > 0 && (
        <Flex flexDir="column">
          <Flex flexDir="column" textAlign="center" px={8}>
            <Divider mb={6} borderColor="cje-gray.100" />
            <Text fontWeight={800} fontSize={14} color="disabled">
              Ce qu'il vous faut
            </Text>
            <Text fontWeight={800} fontSize={18} mt={2}>
              Besoin de quelque chose en particulier ?
            </Text>
          </Flex>
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
            mt={6}
            px={10}
            gap={8}
          >
            {paginatedTags.map((tagsPage) => (
              <Flex
                key={tagsPage.map((tagPage) => tagPage.slug).join("-")}
                flexDir="column"
                minW="90%"
                gap={6}
              >
                {tagsPage.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/dashboard/tag/${tag.slug}`}
                    onClick={() => {
                      push(["trackEvent", "Accueil", "Tags - " + tag.label]);
                    }}
                    passHref
                  >
                    <Flex alignItems="center" justifyContent="space-between">
                      <Flex alignItems="center">
                        <Image
                          src={tag.icon.url as string}
                          alt={tag.icon.alt as string}
                          width={40}
                          height={40}
                        />
                        <Text fontWeight={500} color="blackLight" ml={4}>
                          {tag.label}
                        </Text>
                      </Flex>
                      <Icon as={HiChevronRight} w={6} h={6} mt={0.5} />
                    </Flex>
                  </Link>
                ))}
              </Flex>
            ))}
          </Flex>
        </Flex>
      )}
    </Box>
  );
}
