import { ReactNode, useState } from "react";
import Head from "next/head";
import { Flex, IconButton, useDisclosure, useTheme } from "@chakra-ui/react";
import { ChevronLeftIcon } from "@chakra-ui/icons";
import { useRouter } from "next/router";
import { push } from "@socialgouv/matomo-next";
import { TinyColor } from "@ctrl/tinycolor";
import { Coupon } from "~/payload/payload-types";
import BookmarkOfferModal from "../modals/BookmarkOfferModal";

type OfferHeaderWrapperProps = {
  children: ReactNode;
  kind: "offer" | "coupon";
  setKind: (kind: "offer" | "coupon") => void;
  partnerColor?: string;
  headerComponent?: ReactNode;
  displayBookmarkModal: boolean;
  handleBookmarkOfferToUser: () => Promise<{ data: Coupon }>;
};

const OfferHeaderWrapper = ({
  children,
  kind,
  partnerColor,
  headerComponent,
  displayBookmarkModal,
  handleBookmarkOfferToUser,
  setKind,
}: OfferHeaderWrapperProps) => {
  const router = useRouter();

  const theme = useTheme();
  const backgroundColor = partnerColor
    ? kind === "coupon"
      ? new TinyColor(partnerColor).darken(20).toHexString()
      : partnerColor
    : theme.colors.white;

  const handleBackButton = () => {
    if (kind === "coupon") {
      setKind("offer");
    } else {
      router.back();
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
        <Flex flexDir="column" bgColor={backgroundColor} flex={1} px={8} py={6}>
          <IconButton
            alignSelf="start"
            shadow="default"
            flexShrink={0}
            aria-label="Retour"
            colorScheme="whiteBtn"
            mb={6}
            onClick={() => {
              push(["trackEvent", "Retour"]);
              if (displayBookmarkModal && kind === "offer") {
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
