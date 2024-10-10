import { Flex, Heading, Link, Text } from "@chakra-ui/react";
import BackButton from "~/components/ui/BackButton";
import NextLink from "next/link";

export default function AccountHelp() {
  return (
    <Flex flexDir="column" pt={12} px={8} h="full" textAlign="center">
      <BackButton />
      <Heading as="h2" fontSize={28} fontWeight="extrabold" mt={20}>
        Si vous avez la moindre
        <br />
        question ou remarque,
        <br />
        écrivez-nous ici
      </Heading>
      <Link
        as={NextLink}
        href="mailto:cje@fabrique.social.gouv.fr"
        mt={20}
        passHref
      >
        <Text
          fontSize={24}
          fontWeight={800}
          textDecoration="underline"
          textDecorationThickness="3px"
          textUnderlineOffset={2}
          color="primary"
        >
          cje@fabrique.social.gouv.fr
        </Text>
      </Link>
    </Flex>
  );
}
