import { Flex, Icon, Link, Skeleton, Text } from "@chakra-ui/react";
import { push } from "@socialgouv/matomo-next";
import Image from "next/image";
import NextLink from "next/link";
import { ReactNode } from "react";
import { HiChevronRight } from "react-icons/hi2";
import { api } from "~/utils/api";
import { paginateArray } from "~/utils/tools";

type TagsListProps = {
  baseLink?: string;
};

const TagsList = (props: TagsListProps) => {
  const { baseLink = "/dashboard/tag" } = props;
  const { data: resultTags, isLoading: isLoadingTags } =
    api.globals.tagsListOrdered.useQuery();
  const { data: tags } = resultTags || {};
  const paginatedTags = paginateArray(tags ?? [], 6);

  const Layout = ({ children }: { children: ReactNode }) => {
    return (
      <Flex flexDir="column">
        <Flex flexDir="column" textAlign="center" px={8}>
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
          px={8}
          gap={8}
        >
          {children}
        </Flex>
      </Flex>
    );
  };

  if (isLoadingTags)
    return (
      <Layout>
        {[[...Array(6)], [...Array(6)]].map((_: any[], index) => (
          <Flex flexDir="column" key={index} gap={6}>
            {_.map((__, subIndex) => (
              <Skeleton key={subIndex} w={64} h={10} />
            ))}
          </Flex>
        ))}
      </Layout>
    );

  return (
    <Layout>
      {paginatedTags.map((tagsPage) => (
        <Flex
          key={tagsPage.map((tagPage) => tagPage.slug).join("-")}
          flexDir="column"
          minW={paginatedTags.length > 1 ? "90%" : "full"}
          gap={6}
        >
          {tagsPage.map((tag) => (
            <Link
              key={tag.id}
              as={NextLink}
              href={`${baseLink}/${tag.slug}`}
              onClick={() => {
                push(["trackEvent", "Accueil", "Tags - " + tag.label]);
              }}
              _hover={{ textDecoration: "none" }}
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
                  <Text
                    fontWeight={500}
                    color="blackLight"
                    ml={4}
                    noOfLines={1}
                  >
                    {tag.label}
                  </Text>
                </Flex>
                <Icon as={HiChevronRight} w={6} h={6} mt={0.5} />
              </Flex>
            </Link>
          ))}
        </Flex>
      ))}
    </Layout>
  );
};

export default TagsList;
