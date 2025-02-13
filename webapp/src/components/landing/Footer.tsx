import {
  Box,
  Container,
  Divider,
  Flex,
  Image,
  Text,
  Link,
} from "@chakra-ui/react";
import { menuItems } from "./Header";
import NextLink from "next/link";
import { ExternalLinkIcon } from "@chakra-ui/icons";

const mandatoryLinks = [
  { href: "https://travail-emploi.gouv.fr" },
  { href: "https://service-public.fr" },
  { href: "https://data.gouv.fr" },
  { href: "https://gouvernement.fr" },
];

const secondaryItems = [
  { title: "Accessibilité : Non conforme" },
  { title: "Mentions légales", href: "/mentions-legales" },
  {
    title: "Politique de confidentialité",
    href: "/politique-de-confidentialite",
  },
  { title: "CGU", href: "/cgu" },
];

const Footer = () => {
  const handleIsEligibleClick = () => {
    const element = document.querySelector(".phone-number-footer");
    if (element) (element as HTMLElement).focus();
  };

  return (
    <Flex flexDir="column" w="full" mt={24}>
      <Box bgColor="bgWhite">
        <Container
          maxWidth="container.xl"
          px={{ base: 6, lg: 8, xl: 0 }}
          h="full"
        >
          <Flex
            w="full"
            flexDir={{ base: "column", lg: "row" }}
            ml="auto"
            my={8}
            gap={{ base: 3, lg: 4 }}
            justifyContent={{ base: "start", lg: "space-between" }}
            textAlign="start"
          >
            <Link
              as={NextLink}
              fontSize="sm"
              href="https://beta.gouv.fr/startups/pass.engagement.jeune.html"
              isExternal
            >
              <Flex alignItems="center">
                <Text
                  color="disabled"
                  fontSize={{ base: "sm", lg: "md" }}
                  fontWeight="bold"
                >
                  Voir la page du projet sur beta.gouv
                  <ExternalLinkIcon ml={4} mb={1} />
                </Text>
              </Flex>
            </Link>
          </Flex>
        </Container>
      </Box>
      <Container maxWidth="container.xl" px={0} h="full">
        <Flex flexDir="column" w="full" mt={6}>
          <Flex
            flexDir={{ base: "column", lg: "row" }}
            justifyContent="space-between"
            alignItems="center"
          >
            <Link href="/" w={{ base: "full", lg: "inherit" }}>
              <Flex
                alignItems="center"
                w={{ base: "full", lg: "inherit" }}
                pr={4}
                mr={{ base: 0, lg: 3 }}
              >
                <Image
                  src="/images/landing/ministere-travail.png"
                  alt="Logo marianne du gouvernement français"
                  width="130px"
                  height="130px"
                  mr={4}
                />
                <Image
                  src="/images/cje-logo.png"
                  alt="Logo de l'application Carte Jeune Engagé"
                  width="116px"
                  height="64px"
                />
              </Flex>
            </Link>
            <Flex
              w={{ base: "full", lg: "inherit" }}
              alignItems={{ base: "center", lg: "start" }}
              flexWrap={{ base: "wrap", lg: "nowrap" }}
              justifyContent={{ base: "start", lg: "center" }}
              gap={6}
              mt={{ base: 4, lg: 0 }}
              px={{ base: 6, lg: 8, xl: 0 }}
            >
              {mandatoryLinks.map((link) => (
                <Link as={NextLink} key={link.href} href={link.href} isExternal>
                  <Text
                    color="secondaryText"
                    fontSize={{ base: "sm", lg: "md" }}
                    fontWeight="bold"
                  >
                    {link.href.split("/")[2]}
                    <ExternalLinkIcon ml={1.5} mb={1} />
                  </Text>
                </Link>
              ))}
            </Flex>
          </Flex>
        </Flex>
      </Container>
      <Divider
        borderColor="#DDDDDD"
        w={{ base: "95%", lg: "full" }}
        mx="auto"
        my={6}
      />
      <Container
        maxWidth="container.xl"
        px={{ base: 6, lg: 8, xl: 0 }}
        h="full"
        mb={16}
      >
        <Flex
          alignItems="center"
          justifyContent="start"
          gap={{ base: 0, lg: 6 }}
          flexWrap="wrap"
        >
          {secondaryItems.map((item, index) => {
            const isLink = item.href !== undefined;

            if (!isLink) {
              return (
                <Flex alignItems="center">
                  <Text key={item.title} color="secondaryText" fontSize="sm">
                    {item.title}
                  </Text>
                  <Divider
                    mx={3}
                    display={{ base: "block", lg: "none" }}
                    borderColor="#DDDDDD"
                    orientation="vertical"
                    h={5}
                  />
                </Flex>
              );
            }

            return (
              <Link key={item.title} href={item.href}>
                <Flex alignItems="center">
                  <Text color="secondaryText" fontSize="sm">
                    {item.title}
                  </Text>
                  {index !== secondaryItems.length - 1 && (
                    <Divider
                      mx={3}
                      display={{ base: "block", lg: "none" }}
                      borderColor="#DDDDDD"
                      orientation="vertical"
                      h={5}
                    />
                  )}
                </Flex>
              </Link>
            );
          })}
        </Flex>
      </Container>
    </Flex>
  );
};

export default Footer;
