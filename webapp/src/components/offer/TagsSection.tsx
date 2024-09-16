import { Divider, Flex, Icon, Link, Text } from "@chakra-ui/react";
import { TagIncluded } from "~/server/api/routers/tag";
import NextLink from "next/link";
import { push } from "@socialgouv/matomo-next";
import Image from "next/image";
import { HiChevronRight } from "react-icons/hi2";

type TagsSectionProps = {
  paginatedTags: TagIncluded[][];
};

const TagsSection = (props: TagsSectionProps) => {
  const { paginatedTags } = props;

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
                as={NextLink}
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
  );
};

export default TagsSection;
