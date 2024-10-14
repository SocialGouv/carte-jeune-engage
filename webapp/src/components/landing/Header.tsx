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
  Heading,
  Modal,
  ModalOverlay,
  ModalBody,
  ModalContent,
  Center,
} from "@chakra-ui/react";
import ChakraNextImage from "../ChakraNextImage";
import { HiMiniBars3, HiMiniChevronRight, HiXMark } from "react-icons/hi2";
import NextLink from "next/link";
import { useRef } from "react";
import useActiveSection from "~/hooks/useActiveSection";
import { useOnClickOutside } from "usehooks-ts";
import NextImage from "next/image";
import BaseModal from "../modals/BaseModal";
import QRCodeWrapper from "./QRCode";
import Image from "next/image";
import { useRouter } from "next/router";
import { useAuth } from "~/providers/Auth";

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
  const router = useRouter();
  const { setShowDesktopQRCode } = useAuth();
  const isDesktop = useBreakpointValue({ base: false, lg: true });

  const {
    isOpen: isOpenMenu,
    onToggle: onToggleMenu,
    onClose: onCloseMenu,
  } = useDisclosure();

  const {
    isOpen: isOpenDesktopEligible,
    onOpen: onOpenDesktopEligible,
    onClose: onCloseDesktopEligible,
  } = useDisclosure();

  const headerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(buttonRef, () => {
    if (isOpenMenu) handleOpenMenu();
  });

  const handleOpenMenu = () => {
    setShowDesktopQRCode(isOpenMenu);
    onToggleMenu();
  };

  const handleIsEligibleClick = () => {
    router.push("/login");
  };

  return (
    <>
      <Modal
        isOpen={isOpenDesktopEligible}
        onClose={onCloseDesktopEligible}
        size="full"
      >
        <ModalOverlay />
        <ModalBody flexGrow={0}>
          <ModalContent
            mx="15%"
            minH="auto"
            my="auto"
            bgColor="primary"
            p={8}
            pt={8}
            pb={40}
            borderRadius="5xl"
            position="relative"
          >
            <Button
              w="fit-content"
              size="lg"
              ml="auto"
              colorScheme="whiteBtn"
              fontWeight={800}
              color="black"
              px={3}
              py={2}
              borderRadius="full"
              leftIcon={<Icon as={HiXMark} w={5} h={5} mt="1px" />}
              onClick={onCloseDesktopEligible}
            >
              Fermer
            </Button>
            <Flex
              flexDir="column"
              alignItems="center"
              color="white"
              textAlign="center"
              w="65%"
              mx="auto"
            >
              <Heading fontSize="5xl" fontWeight="extrabold" lineHeight="short">
                Vérifiez directement depuis votre téléphone
              </Heading>
              <Text fontSize={18} fontWeight={500} mt={6} lineHeight="tall">
                Le service est disponible uniquement sur smartphone pour le
                moment. Scannez le QR code avec votre smartphone pour vous
                connecter et voir si vous êtes éligible.
              </Text>
              <Center
                position="relative"
                mt={10}
                bgColor="white"
                p={2.5}
                borderRadius="2.5xl"
              >
                <QRCodeWrapper imageProps={{ h: "150px", w: "150px" }} />
              </Center>
              <Image
                src="/images/landing/desktop-eligible-phone.png"
                alt="Photo téléphone"
                width={0}
                height={0}
                sizes="100vw"
                style={{
                  width: "75%",
                  height: "270px",
                  position: "absolute",
                  bottom: 0,
                  zIndex: -1,
                }}
              />
            </Flex>
          </ModalContent>
        </ModalBody>
      </Modal>
      <Box
        ref={headerRef}
        position="sticky"
        top={0}
        bgColor="white"
        zIndex={100}
        borderBottomWidth={1}
        borderBottomColor="borderGray"
      >
        <Container maxWidth="container.xl" px={0} h="full">
          <Flex
            id="login-gov-image"
            py={{ base: 0, lg: 2 }}
            justifyContent="space-between"
            alignItems="center"
            pl={4}
            pr={6}
          >
            <Link
              display="flex"
              alignItems="center"
              as={NextLink}
              href="/"
              passHref
              _hover={{ textDecor: "none" }}
            >
              <Flex id="login-gov-image" alignItems="center" h="full">
                <NextImage
                  src="/images/landing/ministere-travail.png"
                  alt="Logo marianne du gouvernement français"
                  width={100}
                  height={100}
                  style={{ marginRight: 35 }}
                />
                {isDesktop && (
                  <>
                    <ChakraNextImage
                      src="/images/cje-logo.png"
                      alt="Logo de l'application Carte Jeune Engagé"
                      width={69}
                      height={38}
                      mr={3}
                    />
                    <Text fontWeight={700} fontSize={18}>
                      Carte jeune engagé
                    </Text>
                  </>
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
                  shadow={!isOpenMenu ? "default" : "none"}
                  onClick={
                    isDesktop ? onOpenDesktopEligible : handleIsEligibleClick
                  }
                >
                  Je suis éligible ?
                </Button>
                <Button
                  zIndex={100}
                  leftIcon={
                    <Icon
                      as={!isOpenMenu ? HiMiniBars3 : HiXMark}
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
                  shadow={!isOpenMenu ? "default" : "none"}
                  color="black"
                  minW={isDesktop ? "103px" : "auto"}
                  onClick={handleOpenMenu}
                >
                  {isDesktop && (!isOpenMenu ? "Menu" : "Fermer")}
                </Button>
              </ButtonGroup>
              <Portal containerRef={!isDesktop ? headerRef : buttonRef}>
                <Collapse in={isOpenMenu}>
                  <Box
                    position="fixed"
                    inset={0}
                    opacity={0.25}
                    bgColor="blackLight"
                  />
                  <Flex
                    id="header-menu"
                    flexDir="column"
                    position="absolute"
                    top={{ base: 0, lg: -6 }}
                    right={{ base: 0, lg: -4 }}
                    left={{ base: 0, lg: -40 }}
                    borderRadius={{ base: "none", lg: "5xl" }}
                    bgColor="primary"
                    px={{ base: 10, lg: 12 }}
                    pt={20}
                    pb={5}
                  >
                    <Flex
                      className={isOpenMenu ? "open" : "closed"}
                      flexDir="column"
                    >
                      {menuItems.map(({ link, title }, index) => (
                        <>
                          <Link
                            key={link}
                            as={NextLink}
                            href={
                              link.includes("#") ? `/${link}-section` : link
                            }
                            onClick={onCloseMenu}
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
                    {isDesktop && (
                      <Center
                        flexDir="column"
                        py={6}
                        mt={10}
                        textAlign="center"
                        borderRadius="5xl"
                        w="full"
                        bgColor="white"
                      >
                        <Text fontWeight={800} fontSize={18} mb={1}>
                          Accédez à l’application
                        </Text>
                        <Box
                          p={1}
                          borderRadius="2lg"
                          bgColor="white"
                          w="fit-content"
                        >
                          <QRCodeWrapper />
                        </Box>
                        <Text fontWeight={500} color="disabled">
                          Disponible uniquement sur
                          <br />
                          smartphone 📱
                        </Text>
                      </Center>
                    )}
                  </Flex>
                </Collapse>
              </Portal>
            </Flex>
          </Flex>
        </Container>
      </Box>
    </>
  );
};

export default Header;
