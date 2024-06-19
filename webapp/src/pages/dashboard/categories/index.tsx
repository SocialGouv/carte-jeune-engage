import { Center, Flex, Text } from "@chakra-ui/react";
import Image from "next/image";
import Link from "next/link";
import LoadingLoader from "~/components/LoadingLoader";
import CategoriesWrapper from "~/components/wrappers/CategoriesWrapper";
import { api } from "~/utils/api";
import { push } from "@socialgouv/matomo-next";

export default function CategoriesList() {
  const { data: resultNewCategory, isLoading: isLoadingNewCategory } =
    api.globals.getNewCategory.useQuery();

  const { data: resultCategories, isLoading: isLoadingCategories } =
    api.category.getList.useQuery({
      page: 1,
      perPage: 50,
      sort: "createdAt",
    });

  const { data: newCategory } = resultNewCategory || {};
  const { data: categories } = resultCategories || {};

  if (
    isLoadingCategories ||
    isLoadingNewCategory ||
    !categories ||
    !newCategory
  )
    return (
      <CategoriesWrapper isLoading>
        <Center w="full" h="full">
          <LoadingLoader />
        </Center>
      </CategoriesWrapper>
    );

  return (
    <CategoriesWrapper>
      {[newCategory, ...categories].map((category) => (
        <Link
          key={category.id}
          href={`/dashboard/category/${category.slug}`}
          onClick={() => {
            push(["trackEvent", "Explorer", "Catégories - " + category.label]);
          }}
        >
          <Flex
            flexDir="column"
            borderRadius="xl"
            justifyContent="center"
            alignItems="center"
            textAlign="center"
            bgColor="white"
            h="120px"
          >
            <Image
              src={category.icon.url as string}
              alt={category.icon.alt as string}
              width={58}
              height={58}
            />
            <Text fontWeight="medium" fontSize="sm" mt={1.5}>
              {category.label}
            </Text>
          </Flex>
        </Link>
      ))}
    </CategoriesWrapper>
  );
}
