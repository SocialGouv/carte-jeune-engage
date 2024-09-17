import {
  Box,
  Center,
  Divider,
  Flex,
  Heading,
  Icon,
  IconButton,
  Link,
  Text,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";
import LoadingLoader from "~/components/LoadingLoader";
import SearchBar from "~/components/SearchBar";
import SearchWrapper from "~/components/wrappers/SearchWrapper";
import { api } from "~/utils/api";
import { paginateArray } from "~/utils/tools";
import NextLink from "next/link";
import { push } from "@socialgouv/matomo-next";
import Image from "next/image";
import ChakraNextImage from "~/components/ChakraNextImage";

export default function DashboardSearch() {
  const { data: resultTags, isLoading: isLoadingTags } =
    api.globals.tagsListOrdered.useQuery();

  const { data: resultPartners, isLoading: isLoadingPartners } =
    api.partner.getList.useQuery({ page: 1, perPage: 8 });

  const { data: tags } = resultTags || { data: [] };
  const { data: partners } = resultPartners || { data: [] };

  const paginatedTags = paginateArray(tags, 6);

  if (isLoadingTags || isLoadingPartners)
    return (
      <SearchWrapper>
        <Center h="full" w="full">
          <LoadingLoader />
        </Center>
      </SearchWrapper>
    );

  return (
    <SearchWrapper>
      <>
        {tags.length > 0 && (
          <Box mt={6}>
            <Text fontWeight={800} px={8}>
              Quelque choses en particulier ?
            </Text>
            <Flex
              overflowX="auto"
              whiteSpace="nowrap"
              flexWrap="nowrap"
              position="relative"
              flexDir="column"
              sx={{
                "&::-webkit-scrollbar": {
                  display: "none",
                },
              }}
              mt={6}
              px={8}
              gap={3}
            >
              {paginatedTags.map((tagsPage) => (
                <Flex
                  key={tagsPage.map((tagPage) => tagPage.slug).join("-")}
                  gap={6}
                >
                  {tagsPage.map((tag, tagIndex) => (
                    <Link
                      key={tag.id}
                      as={NextLink}
                      href={`/dashboard/tag/${tag.slug}`}
                      onClick={() => {
                        push(["trackEvent", "Accueil", "Tags - " + tag.label]);
                      }}
                      _hover={{ textDecoration: "none" }}
                      passHref
                    >
                      <Flex
                        w="max-content"
                        flexShrink={0}
                        alignItems="center"
                        borderRadius="2.5xl"
                        borderWidth={1}
                        py={1}
                        pl={2}
                        pr={3}
                        gap={2}
                        mr={tagsPage.length - 1 == tagIndex ? 8 : 0}
                      >
                        <Image
                          src={tag.icon.url as string}
                          alt={tag.icon.alt as string}
                          width={32}
                          height={32}
                        />
                        <Text fontWeight={500} color="blackLight" noOfLines={1}>
                          {tag.label}
                        </Text>
                      </Flex>
                    </Link>
                  ))}
                </Flex>
              ))}
            </Flex>
          </Box>
        )}
        {partners.length > 0 && (
          <Box mt={8} px={8}>
            <Text fontWeight={800} mb={4}>
              Les marques les plus populaires
            </Text>
            {partners.map((partner, index) => (
              <>
                {index !== 0 && <Divider my={1.5} borderColor="cje-gray.300" />}
                <Flex key={partner.id} alignItems="center" gap={3}>
                  <ChakraNextImage
                    src={partner.icon.url as string}
                    alt={partner.icon.alt as string}
                    width={12}
                    height={12}
                    borderRadius="2.5xl"
                    mt={1}
                  />
                  <Text fontWeight={500} fontSize={18} color="blackLight">
                    {partner.name}
                  </Text>
                </Flex>
              </>
            ))}
          </Box>
        )}
      </>
    </SearchWrapper>
  );
}
