import { ReactNode, useState } from "react";
import Head from "next/head";
import {
  Box,
  Flex,
  IconButton,
  useDisclosure,
  useTheme,
} from "@chakra-ui/react";
import { ChevronLeftIcon } from "@chakra-ui/icons";
import { useRouter } from "next/router";
import { push } from "@socialgouv/matomo-next";
import { TinyColor } from "@ctrl/tinycolor";
import { Coupon } from "~/payload/payload-types";
import BookmarkOfferModal from "../modals/BookmarkOfferModal";
import BackButton from "../ui/BackButton";

type OfferHeaderWrapperProps = {
  children: ReactNode;
  kind: "offer" | "coupon";
  setKind: (kind: "offer" | "coupon") => void;
  hasCoupon?: boolean;
  partnerColor?: string;
  headerComponent?: ReactNode;
  offerPageSessionStartTime?: number;
  handleBookmarkOfferToUser: () => Promise<{ data: Coupon }>;
};

const OfferHeaderWrapper = ({
  children,
  kind,
  partnerColor,
  hasCoupon,
  headerComponent,
  offerPageSessionStartTime,
  handleBookmarkOfferToUser,
  setKind,
}: OfferHeaderWrapperProps) => {
  const router = useRouter();

  const { offerKind } = router.query;

  const theme = useTheme();
  const backgroundColor = partnerColor
    ? kind === "coupon"
      ? new TinyColor(partnerColor).darken(20).toHexString()
      : partnerColor
    : theme.colors.white;

  const handleBackButton = () => {
    if (kind === "coupon" && offerKind !== "coupon") {
      setKind("offer");
    } else {
      // push(["trackEvent", "Retour"]);
      const currentTime = new Date().getTime();
      if (
        offerPageSessionStartTime &&
        currentTime - offerPageSessionStartTime > 3000 &&
        !hasCoupon
      ) {
        onOpen();
      } else if (offerKind === "coupon") {
        router.push("/dashboard/wallet");
      } else {
        router.back();
      }
    }
  };

  const [isModalOfferBookmarkSuccess, setIsModalOfferBookmarkSuccess] =
    useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure({
    onClose: () => router.back(),
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
          <Box mb={6}>
            <BackButton onClick={handleBackButton} />
          </Box>
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
