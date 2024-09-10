import { ReactNode, useState } from "react";
import Head from "next/head";
import {
  Button,
  Fade,
  Flex,
  Icon,
  IconButton,
  useDisclosure,
  useTheme,
} from "@chakra-ui/react";
import { ChevronLeftIcon } from "@chakra-ui/icons";
import { useRouter } from "next/router";
import { push } from "@socialgouv/matomo-next";
import { HiMiniEye, HiOutlineBookmark } from "react-icons/hi2";
import { useIntersectionObserver } from "usehooks-ts";
import { TinyColor } from "@ctrl/tinycolor";
import { Coupon } from "~/payload/payload-types";
import BookmarkOfferModal from "../modals/BookmarkOfferModal";

type OfferHeaderWrapperProps = {
  children: ReactNode;
  kind: "offer" | "coupon";
  partnerColor?: string;
  headerComponent?: ReactNode;
  displayBookmarkModal?: boolean;
  handleBookmarkOfferToUser?: () => Promise<{ data: Coupon }>;
};

const OfferHeaderWrapper = ({
  children,
  kind,
  partnerColor,
  headerComponent,
  displayBookmarkModal,
  handleBookmarkOfferToUser,
}: OfferHeaderWrapperProps) => {
  const router = useRouter();

  const theme = useTheme();
  const backgroundColor = partnerColor
    ? kind === "coupon"
      ? new TinyColor(partnerColor).darken(20).toHexString()
      : partnerColor
    : theme.colors.white;

  const { isIntersecting, ref: intersectionRef } = useIntersectionObserver({
    threshold: 0.2,
  });

  const handleBackButton = () => {
    if (window.history?.length > 1) {
      router.back();
    } else {
      router.push("/dashboard");
    }
  };

  const [isModalOfferBookmarkSuccess, setIsModalOfferBookmarkSuccess] =
    useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure({
    onClose: () => handleBackButton(),
  });

  const handleBookmarkOffer = async () => {
    try {
      handleBookmarkOfferToUser && (await handleBookmarkOfferToUser());
      setIsModalOfferBookmarkSuccess(true);
      setTimeout(() => {
        setIsModalOfferBookmarkSuccess(false);
        onClose();
      }, 1000);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <Head>
        <meta name="theme-color" content={backgroundColor} />
      </Head>
      <Flex flexDir="column" h="full">
        <Flex
          flexDir="column"
          bgColor={backgroundColor}
          flex={1}
          px={8}
          py={6}
          ref={intersectionRef}
        >
          <IconButton
            alignSelf="start"
            shadow="default"
            flexShrink={0}
            aria-label="Retour"
            colorScheme="whiteBtn"
            mb={6}
            onClick={() => {
              push(["trackEvent", "Retour"]);
              if (displayBookmarkModal) {
                onOpen();
              } else {
                handleBackButton();
              }
            }}
            borderRadius="2.25xl"
            size="md"
            icon={<ChevronLeftIcon w={6} h={6} color="black" />}
          />
          {headerComponent}
          {kind === "coupon" && children}
        </Flex>
        {kind === "offer" && children}
        {kind === "offer" && (
          <Fade in={!isIntersecting} style={{ zIndex: 10 }}>
            <Flex
              position="fixed"
              zIndex={10}
              alignItems="center"
              bottom={0}
              insetX={0}
              bg="white"
              borderTopColor="cje-gray.300"
              borderTopWidth={1}
              py={4}
              px={4}
              gap={4}
            >
              <Button
                colorScheme="whiteBtn"
                w="40%"
                fontSize={16}
                variant="outline"
                color="blackLight"
                borderColor="cje-gray.300"
                leftIcon={<Icon as={HiOutlineBookmark} w={5} h={5} />}
              >
                Enregistrer
              </Button>
              <Button
                w="60%"
                fontSize={16}
                colorScheme="blackBtn"
                leftIcon={<Icon as={HiMiniEye} w={5} h={5} />}
              >
                Voir mon code
              </Button>
            </Flex>
          </Fade>
        )}
      </Flex>
      <BookmarkOfferModal
        isOpen={isOpen}
        onClose={onClose}
        isModalOfferBookmarkSuccess={isModalOfferBookmarkSuccess}
        handleBookmarkOffer={handleBookmarkOffer}
      />
    </>
  );
};

export default OfferHeaderWrapper;
