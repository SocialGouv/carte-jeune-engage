import { Flex, Text, Icon, Image, Box } from "@chakra-ui/react";
import { OfferIncludedWithUserCoupon } from "~/server/api/routers/offer";
import { dottedPattern } from "~/utils/chakra-theme";
import { push } from "@socialgouv/matomo-next";
import { HiBookmark, HiOutlineBookmark, HiOutlineClock } from "react-icons/hi2";
import { HiClock } from "react-icons/hi2";
import { api } from "~/utils/api";
import { ConditionalLink } from "~/utils/tools";

type OfferCardProps = {
  offer: OfferIncludedWithUserCoupon;
  variant?: "default" | "minimal";
  matomoEvent?: string[];
  onClick?: () => void;
};

const OfferCard = ({
  offer,
  variant = "default",
  matomoEvent = [],
  onClick,
}: OfferCardProps) => {
  const utils = api.useUtils();

  const match = offer.title.match(/\d+%/);

  const [percentage, restOfString] = match
    ? [match[0], offer.title.replace(match[0], "").trim()]
    : [null, offer.title];

  const differenceInDays = Math.floor(
    (new Date(offer.validityTo).setHours(0, 0, 0, 0) -
      new Date().setHours(0, 0, 0, 0)) /
      (1000 * 3600 * 24)
  );

  const isBookmarked = !!offer.userCoupon;

  const expiryText =
    differenceInDays > 0
      ? `Fin dans ${differenceInDays} jour${differenceInDays > 1 ? "s" : ""}`
      : "Offre expirée";

  const { mutateAsync: mutateAsyncCouponToUser } =
    api.coupon.assignToUser.useMutation({
      onSuccess: () => utils.offer.getListOfAvailables.invalidate(),
    });
  const { mutateAsync: mutateAsyncRemoveCouponFromUser } =
    api.coupon.unassignFromUser.useMutation({
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
        onClick={() => onClick && onClick()}
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
            src="/images/landing/mobile-showcase.png"
            alt="image-test"
            objectFit="cover"
            objectPosition="center"
            width="100%"
            height="100%"
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
            top={0}
            w="100%"
            justifyContent={variant === "default" ? "space-between" : "center"}
            alignItems="center"
            p={variant === "default" ? 5 : 2}
            zIndex={2}
          >
            <Flex align="center" gap={3}>
              <Flex
                alignItems="center"
                borderRadius="18px"
                p={1}
                bgColor="white"
              >
                <Image
                  src={offer.partner.icon.url ?? ""}
                  alt={offer.partner.icon.alt ?? ""}
                  width={10}
                  height={10}
                  borderRadius="18px"
                />
              </Flex>
              <Text fontSize="xl" fontWeight="bold" color="white">
                {offer.partner.name}
              </Text>
            </Flex>
            {variant === "default" && (
              <Flex
                alignItems="center"
                justify="center"
                borderRadius="18px"
                py={3}
                px={3.5}
                bgColor="white"
                onClick={(e) => {
                  e.preventDefault();
                  handleBookmarkOffer(offer.id, isBookmarked);
                }}
              >
                <Icon
                  as={isBookmarked ? HiBookmark : HiOutlineBookmark}
                  h={6}
                  w={6}
                />
              </Flex>
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
          <Flex
            alignSelf="center"
            align="center"
            borderRadius="2xl"
            color={variant === "default" ? "white" : "black"}
            bgColor={variant === "default" ? "bgRed" : "inherit"}
            py={1}
            px={2}
          >
            <Icon
              as={variant === "default" ? HiClock : HiOutlineClock}
              w={4}
              h={4}
              mr={1}
            />
            <Text
              fontSize={variant === "default" ? 12 : 14}
              fontWeight={700}
              mb={0.5}
            >
              {expiryText}
            </Text>
          </Flex>
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
