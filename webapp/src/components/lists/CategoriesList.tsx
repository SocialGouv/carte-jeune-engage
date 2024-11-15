import {
  Flex,
  Text,
  Link,
  Skeleton,
  AvatarGroup,
  Avatar,
} from "@chakra-ui/react";
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
    const bgColor = category.color ?? "bgGray";
    const textColor = category.textWhite ? "white" : "black";

    const seenFirstWordPartner = new Set<string>();

    const filteredOffers = category.offers
      .filter((offer) => {
        const [firstWord] = offer.partner.name.split(" ");
        const formatedFirstWord = firstWord.toLowerCase().slice(0, 4);
        return seenFirstWordPartner.has(formatedFirstWord)
          ? false
          : seenFirstWordPartner.add(formatedFirstWord);
      })
      .slice(0, 5);

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
          px={4}
          pt={4}
          pb={2}
          minW="160px"
          maxW="160px"
        >
          <Image
            src={category.icon.url as string}
            alt={category.icon.alt as string}
            width={32}
            height={32}
          />
          <Text
            wordBreak="break-word"
            whiteSpace="normal"
            lineHeight="normal"
            textAlign="center"
            fontWeight={800}
            color={textColor}
            mb={5}
            noOfLines={2}
            h="44px"
          >
            {category.label}
          </Text>
          <Flex w="full">
            {filteredOffers.map((offer, index) => (
              <Flex
                key={offer.id}
                rounded={"full"}
                alignItems={"center"}
                overflow={"hidden"}
                bg="white"
                borderWidth={2}
                borderColor="bgGray"
                width={"44px"}
                height={"44px"}
                marginLeft={index !== 0 ? -6 : 0}
              >
                <Image
                  src={offer.partner.icon.url as string}
                  alt={offer.partner.icon.alt as string}
                  width={44}
                  height={44}
                  boxStyle={{
                    width: "100%",
                    height: "100%",
                  }}
                  imageStyle={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </Flex>
            ))}
          </Flex>
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
        <Flex direction="column" gap={2}>
          {children}
        </Flex>
      </Flex>
    );
  };

  if (isLoadingCategories) {
    return (
      <Layout>
        <Flex gap={2}>
          <Skeleton borderRadius="20px" h={40} w={40} />
          <Skeleton borderRadius="20px" h={40} w={40} />
          <Skeleton borderRadius="20px" h={40} w={40} />
        </Flex>
        <Flex gap={2}>
          <Skeleton borderRadius="20px" h={40} w={40} />
          <Skeleton borderRadius="20px" h={40} w={40} />
          <Skeleton borderRadius="20px" h={40} w={40} />
        </Flex>
      </Layout>
    );
  }

  return (
    <Layout>
      <Flex gap={2}>{firstCategoryRow.map(renderCategory)}</Flex>
      <Flex gap={2}>{secondCategoryRow.map(renderCategory)}</Flex>
    </Layout>
  );
};

export default CategoriesList;
