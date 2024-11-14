import { Flex, Heading, Icon, Link, Text } from "@chakra-ui/react";
import BackButton from "~/components/ui/BackButton";
import NextLink from "next/link";
import { HiMiniChatBubbleLeft } from "react-icons/hi2";

export default function AccountHelp() {
  return (
    <Flex
      flexDir="column"
      alignItems="center"
      pt={12}
      px={8}
      h="full"
      textAlign="center"
    >
      <BackButton />
      <Icon as={HiMiniChatBubbleLeft} w={8} h={8} mt={24} />
      <Heading as="h2" fontSize={28} fontWeight="extrabold" mt={8}>
        Contactez-nous
      </Heading>
      <Text
        fontSize={14}
        fontWeight={500}
        color="secondaryText"
        lineHeight="160%"
        mt={4}
      >
        Pour modifier ou supprimer vos informations,
        <br />
        contactez-nous par mail à l’adresse ci-dessous.
      </Text>
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
