import { ChevronLeftIcon } from "@chakra-ui/icons";
import { Box, Button, Flex, Heading, IconButton } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { ReactNode } from "react";
import { CategoryIncluded } from "~/server/api/routers/category";
import NextImage from "next/image";
import { Image } from "@chakra-ui/next-js";
import { push } from "@socialgouv/matomo-next";

type CategoryWrapperProps = {
  children: ReactNode;
  category: CategoryIncluded;
};

const CategoryWrapper = ({ children, category }: CategoryWrapperProps) => {
  const router = useRouter();
  return (
    <Flex flexDir="column" py={12} px={8} h="full">
      <Box>
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
        <Flex alignItems="center" gap={2} mt={6}>
          <Image
            as={NextImage}
            src={category.icon.url as string}
            alt={category.icon.alt as string}
            width={12}
            height={12}
          />
          <Heading as="h3" fontSize="3xl" fontWeight={800}>
            {category.label}
          </Heading>
        </Flex>
      </Box>
      <Flex flexDir="column" gap={6} mt={8} h="full" pb={12}>
        {children}
      </Flex>
    </Flex>
  );
};

export default CategoryWrapper;
