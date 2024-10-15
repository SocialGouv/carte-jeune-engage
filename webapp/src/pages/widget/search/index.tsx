import { Box, Text, Flex, Link, Divider } from "@chakra-ui/react";
import SearchWrapper from "~/components/wrappers/SearchWrapper";
import { PartnerIncluded } from "~/server/api/routers/partner";
import { TagIncluded } from "~/server/api/routers/tag";
import NextImage from "next/image";
import NextLink from "next/link";
import { push } from "@socialgouv/matomo-next";

export default function WidgetSearch() {
  const searchResults = (
    paginatedTags: TagIncluded[][],
    partners: (PartnerIncluded & { link: string })[],
    debouncedSearch: string
  ) => {
    return (
      <>
        {paginatedTags.length > 0 && (
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
                      href={`/widget/tag/${tag.slug}`}
                      onClick={() => {
                        push(["trackEvent", "Widget", "Tags - " + tag.label]);
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
                        <NextImage
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
                    <NextImage
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
      </>
    );
  };

  return <SearchWrapper fromWidget>{searchResults}</SearchWrapper>;
}
