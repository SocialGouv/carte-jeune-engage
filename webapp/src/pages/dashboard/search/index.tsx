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
import { useState } from "react";
import { useDebounceValue } from "usehooks-ts";
import { HiArrowRight } from "react-icons/hi";

export default function DashboardSearch() {
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounceValue(search, 500);
  const isSearchDebounced = debouncedSearch !== search;

  const { data: resultTags, isLoading: isLoadingTags } =
    api.globals.tagsListOrdered.useQuery({
      search: debouncedSearch,
    });

  const { data: resultOffers, isLoading: isLoadingOffers } =
    api.offer.getListOfAvailables.useQuery({
      page: 1,
      perPage: 8,
      searchOnPartner: debouncedSearch,
    });

  const { data: tags } = resultTags || { data: [] };
  const { data: offers } = resultOffers || { data: [] };

  const partners = offers.map((offer) => ({
    ...offer.partner,
    link: `/dashboard/offer/${offer.id}`,
  }));

  const paginatedTags = paginateArray(tags, 6);

  if (isLoadingTags || isLoadingOffers || isSearchDebounced)
    return (
      <SearchWrapper search={search} setSearch={setSearch}>
        <Center h="full" w="full">
          <LoadingLoader />
        </Center>
      </SearchWrapper>
    );

  return (
    <SearchWrapper search={search} setSearch={setSearch}>
      <>
        {tags.length > 0 && (
          <Box mt={6}>
            {!debouncedSearch && (
              <Text fontWeight={800} px={8}>
                Quelque choses en particulier ?
              </Text>
            )}
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
            {!debouncedSearch && (
              <Text fontWeight={800} mb={4}>
                Les marques les plus populaires
              </Text>
            )}
            {partners.map((partner, index) => (
              <>
                <Link
                  as={NextLink}
                  href={partner.link}
                  _hover={{ textDecoration: "none" }}
                  passHref
                >
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
                </Link>
                {partners.length !== index && (
                  <Divider my={1.5} borderColor="cje-gray.300" />
                )}
              </>
            ))}
          </Box>
        )}
        {!!debouncedSearch && (
          <Box mt={32} px={20}>
            <Text color="disabled" textAlign="center" fontSize={18}>
              Nous n'avons pas
              <br />
              <Text fontWeight={800}>"{debouncedSearch}"</Text>
              pour l'instant
            </Text>
            <Center
              mt={4}
              borderBottomWidth={2}
              borderBottomColor="black"
              color="black"
              w="fit-content"
              mx="auto"
            >
              <Text fontWeight={800} fontSize={14}>
                Demander : "{debouncedSearch}"
              </Text>
              <Icon as={HiArrowRight} w={3.5} h={3.5} ml={0.5} />
            </Center>
          </Box>
        )}
      </>
    </SearchWrapper>
  );
}
