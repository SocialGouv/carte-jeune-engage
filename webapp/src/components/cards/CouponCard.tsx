import { Flex, Text } from "@chakra-ui/react";
import Image from "next/image";
import { dottedPattern } from "~/utils/chakra-theme";
import { CouponIncluded } from "~/server/api/routers/coupon";

type CouponCardProps = {
  coupon: CouponIncluded;
  displayExpiryDate?: boolean;
  matomoEvent?: string[];
};

const CouponCard = ({ coupon }: CouponCardProps) => {
  return (
    <Flex flexDir="column">
      <Flex
        bgColor={coupon.offer.partner.color}
        py={5}
        borderTopRadius={12}
        position="relative"
        justifyContent="center"
        alignItems="center"
        sx={{ ...dottedPattern("#ffffff") }}
      >
        <Flex alignItems="center" borderRadius="full" p={1} bgColor="white">
          <Image
            src={coupon.offer.partner.icon.url ?? ""}
            alt={coupon.offer.partner.icon.alt ?? ""}
            width={42}
            height={42}
            style={{
              borderRadius: "50%",
            }}
          />
        </Flex>
      </Flex>
      <Flex
        flexDir="column"
        p={3}
        bgColor="white"
        borderBottomRadius={8}
        gap={2}
        boxShadow="md"
      >
        <Text fontWeight="bold" fontSize="sm" noOfLines={2} h="42px">
          {coupon.offer.title}
        </Text>
      </Flex>
    </Flex>
  );
};

export default CouponCard;
