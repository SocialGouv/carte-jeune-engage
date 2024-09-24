import {
  Box,
  Button,
  Collapse,
  Container,
  Flex,
  Icon,
  Portal,
  Link,
  Text,
  useBreakpointValue,
  useDisclosure,
  ButtonGroup,
  Divider,
} from "@chakra-ui/react";
import ChakraNextImage from "../ChakraNextImage";
import { HiMiniBars3, HiMiniChevronRight, HiXMark } from "react-icons/hi2";
import NextLink from "next/link";
import { useRef } from "react";
import useActiveSection from "~/hooks/useActiveSection";
import { useOnClickOutside } from "usehooks-ts";

export const menuItems: { title: string; link: string }[] = [
  { title: "Les entreprises engagées", link: "/partners" },
  {
    title: "Qui a le droit à la carte “jeune engagé” ?",
    link: "#who-can-benefit",
  },
  { title: "Comment utiliser les réductions ?", link: "#how-does-it-work" },
  {
    title: "Comment avoir la carte “jeune engagé” ?",
    link: "#how-to-access-it",
  },
  { title: "FAQ", link: "#faq" },
  { title: "Pourquoi avoir créé la carte “jeune engagé” ?", link: "#why" },
];

const Header = () => {
  const isDesktop = useBreakpointValue({ base: false, lg: true });

  const { isOpen, onToggle } = useDisclosure();

  const headerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(buttonRef, () => {
    if (isOpen) onToggle();
  });

  const activeSection = useActiveSection(
    menuItems.map((item) => `${item.link.replace("#", "")}-section`)
  );

  const handleIsEligibleClick = () => {
    const element = document.querySelector(".phone-number-cta");
    if (element) (element as HTMLElement).focus();
    onToggle();
  };

  return (
    <Box ref={headerRef} position="sticky" top={0} zIndex={10}>
      <Container maxWidth="container.xl" px={0} h="full">
        <Flex
          id="login-gov-image"
          py={6}
          pb={4}
          bgColor="white"
          justifyContent="space-between"
          alignItems="center"
          pl={4}
          pr={6}
        >
          <Link href="/">
            <Flex id="login-gov-image" alignItems="center" h="full">
              <ChakraNextImage
                src="/images/marianne.svg"
                alt="Logo marianne du gouvernement français"
                width={74}
                height={49}
                pr={2}
                mr={3}
              />
              {isDesktop && (
                <ChakraNextImage
                  src="/images/cje-logo.png"
                  alt="Logo de l'application Carte Jeune Engagé"
                  width={69}
                  height={38}
                />
              )}
            </Flex>
          </Link>
          <Flex alignItems="center" ml="auto">
            <ButtonGroup spacing={4} position="relative" ref={buttonRef}>
              <Button
                zIndex={100}
                colorScheme="blackBtn"
                size="md"
                borderRadius="2.25xl"
                fontSize={{ base: 14, lg: 16 }}
                py={2.5}
                px={6}
                fontWeight={800}
                shadow={!isOpen ? "default" : "none"}
              >
                Je suis éligible ?
              </Button>
              <Button
                zIndex={100}
                leftIcon={
                  <Icon
                    as={!isOpen ? HiMiniBars3 : HiXMark}
                    w={5}
                    h={5}
                    color="black"
                  />
                }
                colorScheme="whiteBtn"
                size="md"
                p={2.5}
                borderRadius="2.25xl"
                fontWeight={800}
                iconSpacing={isDesktop ? 2 : 0}
                shadow={!isOpen ? "default" : "none"}
                color="black"
                minW={isDesktop ? "103px" : "auto"}
                onClick={onToggle}
              >
                {isDesktop && (!isOpen ? "Menu" : "Fermer")}
              </Button>
            </ButtonGroup>
            <Portal containerRef={!isDesktop ? headerRef : buttonRef}>
              <Collapse in={isOpen}>
                <Flex
                  id="header-menu"
                  className={isOpen ? "open" : "closed"}
                  flexDir="column"
                  position="absolute"
                  top={{ base: 0, lg: -4 }}
                  right={{ base: 0, lg: -4 }}
                  left={{ base: 0, lg: -44 }}
                  borderRadius={{ base: "none", lg: "5xl" }}
                  pt={20}
                  pb={12}
                  px={{ base: 10, lg: 16 }}
                  bgColor="primary"
                >
                  {menuItems.map(({ link, title }, index) => (
                    <>
                      <Link
                        key={link}
                        as={NextLink}
                        href={`/${link}-section` ?? "#"}
                        onClick={onToggle}
                        justifyContent="space-between"
                        alignItems="center"
                        _hover={{
                          textDecoration: "none",
                        }}
                        mt={index === 0 ? 2.5 : 0}
                      >
                        <Flex
                          alignItems="center"
                          justifyContent="space-between"
                        >
                          <Text
                            fontWeight={800}
                            fontSize={{ base: 18, lg: 20 }}
                            color="white"
                          >
                            {title}
                          </Text>
                          <Icon
                            as={HiMiniChevronRight}
                            w={5}
                            h={5}
                            color="white"
                          />
                        </Flex>
                      </Link>
                      {index !== menuItems.length - 1 && (
                        <Divider borderColor="bgGray" my={2.5} />
                      )}
                    </>
                  ))}
                </Flex>
              </Collapse>
            </Portal>
          </Flex>
        </Flex>
      </Container>
    </Box>
  );
};

export default Header;
