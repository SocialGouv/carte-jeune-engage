import { ChevronLeftIcon } from "@chakra-ui/icons";
import { Box, Center, Flex, Heading, IconButton, Text } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { ReactNode } from "react";
import { CategoryIncluded } from "~/server/api/routers/category";
import Image from "next/image";
import { push } from "@socialgouv/matomo-next";
import { TagIncluded } from "~/server/api/routers/tag";
import { usePathname } from "next/navigation";

type CategoryWrapperProps = {
  children: ReactNode;
  category?: CategoryIncluded;
  tag?: TagIncluded;
  tags?: TagIncluded[];
  selectedTagIds?: number[];
  onSelectTag?: (tagId: number) => void;
};

const CategoryWrapper = ({
  children,
  category,
  tags,
  selectedTagIds,
  onSelectTag,
}: CategoryWrapperProps) => {
  const router = useRouter();

  const pathname = usePathname();
  const isTagRoute = pathname.includes("/tag/");

  const { slug } = router.query;

  const uniqueTags = tags
    ? Array.from(new Map(tags.map((tag) => [tag.id, tag])).values())
    : [];

  return (
    <Flex flexDir="column" py={12} h="full">
      <Box px={8}>
        <IconButton
          alignSelf="start"
          shadow="default"
          aria-label="Retour"
          colorScheme="whiteBtn"
          onClick={() => {
            push(["trackEvent", "Retour"]);
            router.back();
          }}
          borderRadius="2.25xl"
          size="md"
          icon={<ChevronLeftIcon w={6} h={6} color="black" />}
        />
        {category && (
          <Flex alignItems="center" gap={2} mt={6}>
            <Image
              src={category.icon.url as string}
              alt={category.icon.alt as string}
              width={48}
              height={48}
            />
            <Heading as="h3" fontSize="3xl" fontWeight={800}>
              {category.label}
            </Heading>
          </Flex>
        )}
      </Box>
      {uniqueTags.length > 0 && (
        <Flex
          key="tags"
          alignItems="center"
          px={8}
          w="full"
          flexShrink={0}
          overflowX="auto"
          sx={{
            "::-webkit-scrollbar": {
              display: "none",
            },
          }}
          gap={3}
          mt={6}
        >
          {uniqueTags
            .sort((a, b) => {
              const isSelectedA = selectedTagIds?.includes(a.id);
              const isSelectedB = selectedTagIds?.includes(b.id);
              if (isSelectedA && !isSelectedB) return -1;
              if (!isSelectedA && isSelectedB) return 1;
              return a.label.localeCompare(b.label);
            })
            .map((tag) => {
              const isSelected = selectedTagIds?.includes(tag.id);
              return (
                <Center
                  key={tag.id}
                  onClick={() => {
                    push([
                      "trackEvent",
                      "Explorer",
                      category
                        ? `Catégories - ${category.label} - Tag - ${tag.label}`
                        : `Tag - ${tag.label}`,
                    ]);
                    if (onSelectTag) {
                      // To prevent to uncheck current route tag
                      if (!category && isTagRoute && slug === tag.slug) return;
                      onSelectTag(tag.id);
                    }
                  }}
                  bgColor={isSelected ? "blackLight" : "inherit"}
                  borderColor="cje-gray.200"
                  px={4}
                  py={1}
                  gap={2}
                  minW="fit-content"
                  borderWidth={1}
                  borderRadius="full"
                >
                  <Image
                    src={tag.icon.url as string}
                    alt={tag.icon.alt as string}
                    width={28}
                    height={28}
                  />
                  <Text
                    color={isSelected ? "white" : "blackLight"}
                    fontWeight={500}
                  >
                    {tag.label}
                  </Text>
                </Center>
              );
            })}
        </Flex>
      )}
      <Flex flexDir="column" gap={6} mt={8} pb={12} px={8}>
        {children}
      </Flex>
    </Flex>
  );
};

export default CategoryWrapper;
