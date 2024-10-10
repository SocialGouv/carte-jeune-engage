import { Box, Button, Flex, Icon, IconButton, Text } from "@chakra-ui/react";
import { push } from "@socialgouv/matomo-next";
import Image from "next/image";
import { HiBookmark, HiOutlineBookmark } from "react-icons/hi2";
import { TbCircleCheckFilled } from "react-icons/tb";
import { OfferIncludedWithUserCoupon } from "~/server/api/routers/offer";
import { api } from "~/utils/api";
import { dottedPattern } from "~/utils/chakra-theme";
import ConditionalLink from "../ConditionalLink";
import ExpiryTag from "../offer/ExpiryTag";
import { BsEyeFill } from "react-icons/bs";

type OfferCardProps = {
  offer: OfferIncludedWithUserCoupon;
  variant?: "default" | "minimal";
  matomoEvent?: string[];
  handleValidateOffer?: (offerId: number) => void;
  disabled?: boolean;
  fromWidget?: boolean;
};

const OfferCard = ({
  offer,
  variant = "default",
  matomoEvent = [],
  handleValidateOffer,
  disabled,
  fromWidget,
}: OfferCardProps) => {
  const utils = api.useUtils();

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
      to={fromWidget ? `https://google.com/` : `/dashboard/offer/${offer.id}`}
      target={fromWidget ? "_blank" : "_self"}
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
        bg="white"
        borderRadius={20}
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
          <Flex opacity={disabled ? 0.6 : 1}>
            <Image
              src={offer.image?.url ?? "/images/landing/mobile-showcase.png"}
              alt={offer.image?.alt ?? "Image par défaut de l'offre"}
              loading="eager"
              objectFit="cover"
              objectPosition="center"
              layout="fill"
            />
          </Flex>
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
          {disabled ? (
            <Box
              color="success"
              bg="successLight"
              fontSize="sm"
              rounded={"2xl"}
              px={10}
              py={1.5}
              mx={"auto"}
              fontWeight="bold"
              display="inline-block"
            >
              <Flex alignItems={"center"} gap={1}>
                Offre déjà utilisée <TbCircleCheckFilled size={"1.2rem"} />
              </Flex>
            </Box>
          ) : (
            <ExpiryTag expiryDate={offer.validityTo} variant={variant} />
          )}
          <Flex
            flexDir="column"
            textAlign="center"
            h="154px"
            opacity={disabled ? 0.6 : 1}
          >
            <Text fontSize={18} fontWeight={800} noOfLines={2}>
              {offer.title}
            </Text>
            <Text fontWeight={500} noOfLines={4} mt={1}>
              {offer.subtitle}
            </Text>
          </Flex>
          {fromWidget && (
            <Button
              alignSelf="center"
              variant="outline"
              rounded={"full"}
              borderColor="borderGray"
              py={6}
              fontSize={"md"}
              fontWeight={900}
              mb={2}
            >
              <Icon as={BsEyeFill} fontSize="xl" mr={2} /> Voir mon code
            </Button>
          )}
        </Flex>
      </Flex>
    </ConditionalLink>
  );
};

export default OfferCard;
