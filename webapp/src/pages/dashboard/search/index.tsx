import {
  Box,
  Button,
  Center,
  Divider,
  Fade,
  Flex,
  Icon,
  Link,
  Text,
} from "@chakra-ui/react";
import LoadingLoader from "~/components/LoadingLoader";
import SearchWrapper from "~/components/wrappers/SearchWrapper";
import { api } from "~/utils/api";
import { paginateArray } from "~/utils/tools";
import NextLink from "next/link";
import { push } from "@socialgouv/matomo-next";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useDebounceValue } from "usehooks-ts";
import { HiCheckCircle } from "react-icons/hi2";

export default function DashboardSearch() {
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounceValue(search, 500);
  const isSearchDebounced = debouncedSearch !== search;

  const [displayRequestCard, setDisplayRequestCard] = useState(true);

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

  const {
    mutateAsync: upsertSearchRequest,
    isLoading: isLoadingUpsertSearchRequest,
    isSuccess: isSuccessUpsertSearchRequest,
    reset: resetUpsertSearchRequest,
  } = api.searchRequest.upsert.useMutation();

  const { data: tags } = resultTags || { data: [] };
  const { data: offers } = resultOffers || { data: [] };

  const partners = offers.map((offer) => ({
    ...offer.partner,
    link: `/dashboard/offer/${offer.id}`,
  }));

  const paginatedTags = paginateArray(tags, 6);

  const handleUpsertSearchRequest = async () => {
    await upsertSearchRequest(debouncedSearch);
  };

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (isSuccessUpsertSearchRequest)
      timeoutId = setTimeout(() => {
        setDisplayRequestCard(false);
        setTimeout(() => resetUpsertSearchRequest(), 100);
      }, 2000);
    return () => clearTimeout(timeoutId);
  }, [isSuccessUpsertSearchRequest]);

  useEffect(() => {
    setDisplayRequestCard(true);
    resetUpsertSearchRequest();
  }, [debouncedSearch]);

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
                  flexDir={debouncedSearch ? "column" : "row"}
                  gap={debouncedSearch ? 3 : 6}
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
                    <Image
                      src={partner.icon.url as string}
                      alt={partner.icon.alt as string}
                      width={42}
                      height={42}
                      style={{ borderRadius: "20px", marginTop: "4px" }}
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
          <Box mt={12}>
            <Text color="disabled" textAlign="center" px={20}>
              Nous n'avons pas
              <br />
              <Text fontWeight={800}>"{debouncedSearch}"</Text>
              pour l'instant
            </Text>
            <Fade in={displayRequestCard} style={{ zIndex: 10 }}>
              <Box px={8}>
                <Center
                  flexDir="column"
                  borderRadius="2.5xl"
                  bgColor="bgGray"
                  px={4}
                  pt={8}
                  pb={4}
                  mt={6}
                >
                  {isSuccessUpsertSearchRequest && (
                    <Icon as={HiCheckCircle} w={10} h={10} color="success" />
                  )}
                  <Text
                    fontWeight={800}
                    fontSize={18}
                    textAlign="center"
                    mt={isSuccessUpsertSearchRequest ? 4 : 0}
                  >
                    {isSuccessUpsertSearchRequest
                      ? "Votre demande pour ajouter"
                      : "Ça vous dirait qu’on ajoute"}
                    <br />"
                    <Text
                      as="span"
                      textDecoration="underline"
                      textDecorationThickness="2px"
                      textUnderlineOffset={2}
                      pb={0}
                    >
                      {debouncedSearch}
                    </Text>
                    ”{" "}
                    {isSuccessUpsertSearchRequest
                      ? "est enregistrée"
                      : "dans l’appli ?"}
                  </Text>
                  {!isSuccessUpsertSearchRequest && (
                    <>
                      <Button
                        colorScheme="primaryShades"
                        mt={4}
                        size="md"
                        py={5.5}
                        fontSize={14}
                        w="full"
                        isLoading={isLoadingUpsertSearchRequest}
                        onClick={handleUpsertSearchRequest}
                      >
                        Oui !
                      </Button>
                      <Button
                        colorScheme="whiteBtn"
                        variant="ghost"
                        color="disabled"
                        mt={2}
                        fontSize={14}
                        size="md"
                        py={0}
                        w="full"
                        onClick={() => setDisplayRequestCard(false)}
                      >
                        En fait, non
                      </Button>
                    </>
                  )}
                </Center>
              </Box>
            </Fade>
          </Box>
        )}
      </>
    </SearchWrapper>
  );
}
