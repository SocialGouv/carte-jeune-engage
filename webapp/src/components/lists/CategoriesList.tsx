import { Flex, Box, Text, Grid, Link, Skeleton } from "@chakra-ui/react";
import { api } from "~/utils/api";
import Image from "../ui/Image";
import NextLink from "next/link";
import { CategoryIncluded } from "~/server/api/routers/category";
import { OfferIncluded } from "~/server/api/routers/offer";
import { push } from "@socialgouv/matomo-next";
import { ReactNode } from "react";

type CategoriesListProps = {
  offers: OfferIncluded[];
  baseLink?: string;
};

type CategoryWithOffers = CategoryIncluded & { offers: OfferIncluded[] };

const CategoriesList = (props: CategoriesListProps) => {
  const { offers, baseLink = "/dashboard/category" } = props;

  const { data: resultCategories, isLoading: isLoadingCategories } =
    api.globals.categoriesListOrdered.useQuery();
  const { data: categories } = resultCategories || {};

  const formatedCategories = [] as CategoryWithOffers[];

  (categories || []).forEach((category) => {
    if (
      offers.some((offer) =>
        offer.category
          .map((offerCategory) => offerCategory.id)
          .includes(category.id)
      )
    ) {
      formatedCategories.push({
        ...category,
        offers: offers
          .filter((offer) =>
            offer.category
              .map((offerCategory) => offerCategory.id)
              .includes(category.id)
          )
          .slice(0, 6),
      });
    }
  });

  const firstCategoryRow = formatedCategories.filter(
    (_, index) => index % 2 === 0
  );
  const secondCategoryRow = formatedCategories.filter(
    (_, index) => index % 2 !== 0
  );

  const renderCategory = (category: CategoryWithOffers) => {
    const bgColor = category.color ?? "cje-gray.100";
    const textColor = category.textWhite ? "white" : "black";

    return (
      <Link
        as={NextLink}
        key={category.id}
        href={`${baseLink}/${category.slug}`}
        onClick={() => {
          push(["trackEvent", "Accueil", "Catégories - " + category.label]);
        }}
        _hover={{ textDecoration: "none" }}
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
            height={40}
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
          <Grid templateColumns="repeat(3, 1fr)" gap={2}>
            {category.offers?.map((offer) => (
              <Flex
                key={offer.id}
                alignItems={"center"}
                justifyContent={"center"}
                borderRadius="50%"
                overflow="hidden"
                width="40px"
                height="40px"
                bg="white"
                p={1}
              >
                <Image
                  src={offer.partner.icon.url as string}
                  alt={offer.partner.icon.alt as string}
                  width={40}
                  height={40}
                />
              </Flex>
            ))}
          </Grid>
        </Flex>
      </Link>
    );
  };

  const Layout = ({ children }: { children: ReactNode }) => {
    return (
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
          {children}
        </Flex>
      </Flex>
    );
  };

  if (isLoadingCategories) {
    return (
      <Layout>
        <Flex gap={4}>
          <Skeleton borderRadius="20px" h={48} w={40} />
          <Skeleton borderRadius="20px" h={48} w={40} />
          <Skeleton borderRadius="20px" h={48} w={40} />
        </Flex>
        <Flex gap={4}>
          <Skeleton borderRadius="20px" h={48} w={40} />
          <Skeleton borderRadius="20px" h={48} w={40} />
          <Skeleton borderRadius="20px" h={48} w={40} />
        </Flex>
      </Layout>
    );
  }

  return (
    <Layout>
      <Flex gap={4}>{firstCategoryRow.map(renderCategory)}</Flex>
      <Flex gap={4}>{secondCategoryRow.map(renderCategory)}</Flex>
    </Layout>
  );
};

export default CategoriesList;
