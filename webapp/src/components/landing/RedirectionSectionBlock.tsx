import { Flex, Icon, Link, Text } from "@chakra-ui/react";
import Image from "next/image";
import NextLink from "next/link";
import { HiMiniArrowTopRightOnSquare } from "react-icons/hi2";

const RedirectionSectionBlock = () => {
  return (
    <Flex
      flexDir="column"
      mt={20}
      px={{ base: 8, lg: 28 }}
      py={14}
      bgColor="primary"
      color="white"
      borderRadius="5xl"
    >
      <Image
        src="/images/cje-logo-white-blue.svg"
        alt="Logo cje"
        width={75}
        height={40}
      />
      <Text fontWeight={800} fontSize={18} mt={4}>
        Vous voulez en savoir plus sur la création du dispositif carte “jeune
        engagé” ?
      </Text>
      <Link
        as={NextLink}
        href="https://beta.gouv.fr/startups/pass.engagement.jeune.html"
        target="_blank"
        mt={6}
        passHref
        _hover={{ textDecoration: "none" }}
      >
        <Flex alignItems="center" borderBottomWidth={1} pb={4}>
          <Text fontWeight={500}>
            Voir la page beta.gouv de l’application carte “jeune engagé”
          </Text>
          <Icon as={HiMiniArrowTopRightOnSquare} w={6} h={6} ml={2} />
        </Flex>
      </Link>
    </Flex>
  );
};

export default RedirectionSectionBlock;
