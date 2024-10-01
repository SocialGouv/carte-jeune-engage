import { Flex, Text, Icon, Box, IconButton } from "@chakra-ui/react";
import { OfferIncludedWithUserCoupon } from "~/server/api/routers/offer";
import { dottedPattern } from "~/utils/chakra-theme";
import { push } from "@socialgouv/matomo-next";
import { HiBookmark, HiOutlineBookmark, HiOutlineClock } from "react-icons/hi2";
import { HiClock } from "react-icons/hi2";
import { api } from "~/utils/api";
import ConditionalLink from "../ConditionalLink";
import Image from "next/image";
import ExpiryTag from "../offer/ExpiryTag";

type OfferCardProps = {
  offer: OfferIncludedWithUserCoupon;
  variant?: "default" | "minimal";
  matomoEvent?: string[];
  handleValidateOffer?: (offerId: number) => void;
};

const OfferCard = ({
  offer,
  variant = "default",
  matomoEvent = [],
  handleValidateOffer,
}: OfferCardProps) => {
  const utils = api.useUtils();
  const match = offer.title.match(/\d+%/);

  const [percentage, restOfString] = match
    ? [match[0], offer.title.replace(match[0], "").trim()]
    : [null, offer.title];

  const isBookmarked = !!offer.userCoupon;

  const {
    mutateAsync: mutateAsyncCouponToUser,
    isLoading: isLoadingCouponToUser,
  } = api.coupon.assignToUser.useMutation({
    onSuccess: () => utils.offer.getListOfAvailables.invalidate(),
  });
  const {
    mutateAsync: mutateAsyncRemoveCouponFromUser,
    isLoading: isLoadingRemoveCouponFromUser,
  } = api.coupon.unassignFromUser.useMutation({
    onSuccess: () => utils.offer.getListOfAvailables.invalidate(),
  });

  const handleBookmarkOffer = async (
    offerId: number,
    isAssignedToUser: boolean
  ) => {
    if (!isAssignedToUser) {
      await mutateAsyncCouponToUser({ offer_id: offerId });
    } else {
      const currentUserCoupon = offer.userCoupon;
      if (!currentUserCoupon) return;
      await mutateAsyncRemoveCouponFromUser({
        coupon_id: currentUserCoupon.id,
      });
    }
  };

  return (
    <ConditionalLink
      to={`/dashboard/offer/${offer.id}`}
      condition={variant === "default"}
      props={{
        onClick: () => {
          if (!!matomoEvent.length) push(["trackEvent", ...matomoEvent]);
        },
        _hover: { textDecoration: "none" },
      }}
    >
      <Flex
        flexDir="column"
        pb={variant === "default" ? 8 : 0}
        onClick={() => {
          if (variant === "minimal" && handleValidateOffer)
            handleValidateOffer(offer.id);
        }}
      >
        <Flex
          borderTopRadius={20}
          position="relative"
          justifyContent="flex-start"
          alignItems="flex-start"
          overflow="hidden"
          height="256px"
          sx={{ ...dottedPattern("#ffffff") }}
        >
          <Image
            src={offer.image?.url ?? "/images/landing/mobile-showcase.png"}
            alt={offer.image?.alt ?? "Image par défaut de l'offre"}
            loading="eager"
            objectFit="cover"
            objectPosition="center"
            layout="fill"
          />
          <Box
            position="absolute"
            top="0"
            left="0"
            width="100%"
            height="50%"
            bgGradient="linear(to-b, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0))"
            zIndex={1}
          />
          <Flex
            position="absolute"
            w="full"
            justifyContent={variant === "default" ? "space-between" : "center"}
            alignItems="center"
            p={variant === "default" ? 5 : 2}
            zIndex={2}
          >
            <Flex align="center" gap={3}>
              <Flex
                alignItems="center"
                borderRadius="2.25xl"
                p={1}
                bgColor="white"
              >
                <Image
                  src={offer.partner.icon.url ?? ""}
                  alt={offer.partner.icon.alt ?? ""}
                  width={40}
                  height={40}
                  style={{ borderRadius: "1.125rem" }}
                />
              </Flex>
              <Text fontSize="xl" fontWeight="bold" color="white">
                {offer.partner.name}
              </Text>
            </Flex>
            {variant === "default" && (
              <IconButton
                aria-label="Enregistrer l'offre"
                alignItems="center"
                borderRadius="2.25xl"
                isLoading={
                  isLoadingCouponToUser || isLoadingRemoveCouponFromUser
                }
                colorScheme="whiteBtn"
                _loading={{ opacity: 1, color: "black" }}
                onClick={(e) => {
                  e.preventDefault();
                  handleBookmarkOffer(offer.id, isBookmarked);
                }}
                icon={
                  <Icon
                    color="black"
                    as={isBookmarked ? HiBookmark : HiOutlineBookmark}
                    h={6}
                    w={6}
                  />
                }
              />
            )}
          </Flex>
        </Flex>
        <Flex
          flexDir={variant === "default" ? "column" : "column-reverse"}
          p={3}
          bgColor="white"
          borderBottomRadius={20}
          gap={2}
          shadow="default"
        >
          <ExpiryTag expiryDate={offer.validityTo} variant={variant} />
          <Flex
            flexDir="column"
            alignItems="center"
            justify="center"
            textAlign="center"
          >
            {percentage && (
              <Text fontSize="lg" fontWeight={800}>
                {percentage}
              </Text>
            )}
            <Text minH="80px" fontWeight={500} mt={1}>
              {restOfString}
            </Text>
          </Flex>
        </Flex>
      </Flex>
    </ConditionalLink>
  );
};

export default OfferCard;
