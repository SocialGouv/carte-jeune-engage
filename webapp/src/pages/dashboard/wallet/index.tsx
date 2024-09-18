import {
  Box,
  Button,
  Center,
  Divider,
  Flex,
  Heading,
  Icon,
  Link,
  Text,
} from "@chakra-ui/react";
import LoadingLoader from "~/components/LoadingLoader";
import WalletWrapper from "~/components/wrappers/WalletWrapper";
import { api } from "~/utils/api";
import CouponCard from "~/components/cards/CouponCard";
import { HiChevronRight, HiReceiptRefund, HiArrowRight } from "react-icons/hi2";
import NextLink from "next/link";
import { useRouter } from "next/router";
import TagsSection from "~/components/offer/TagsSection";

export default function Wallet() {
  const router = useRouter();

  const { data: resultUserCoupons, isLoading: isLoadingUserCoupons } =
    api.coupon.getList.useQuery();

  const { data: resultTags, isLoading: isLoadingTags } =
    api.globals.tagsListOrdered.useQuery();

  const { data: currentUserCoupons } = resultUserCoupons || {};
  const { data: tags } = resultTags || {};

  if (isLoadingUserCoupons || isLoadingTags)
    return (
      <WalletWrapper>
        <Center h="85%" w="full">
          <LoadingLoader />
        </Center>
      </WalletWrapper>
    );

  return (
    <WalletWrapper>
      {currentUserCoupons && currentUserCoupons.length > 0 ? (
        <>
          <Flex flexDir="column" gap={6}>
            {currentUserCoupons.map((coupon, index) => (
              <Box
                mt={index !== 0 ? -16 : 0}
                bgColor="white"
                w="full"
                pt={index !== 0 ? 3 : 0}
                zIndex={1}
                borderTopWidth={index !== 0 ? 1 : 0}
                px={8}
              >
                <CouponCard
                  key={coupon.id}
                  coupon={coupon}
                  link={`/dashboard/offer/${coupon.offer.id}?offerKind=coupon`}
                  mode="wallet"
                />
              </Box>
            ))}
          </Flex>
          <Box px={8}>
            <Divider mt={16} borderColor="cje-gray.100" />
            <Link
              as={NextLink}
              href="/dashboard/account/history"
              _hover={{ textDecoration: "none" }}
              passHref
            >
              <Flex alignItems="center" justifyContent="space-between" py={5}>
                <Flex alignItems="center" gap={4}>
                  <Icon
                    as={HiReceiptRefund}
                    w={5}
                    h={5}
                    mt={0.5}
                    color="blackLight"
                  />
                  <Text fontWeight={500}>Historique des réductions</Text>
                </Flex>
                <Icon as={HiChevronRight} w={6} h={6} />
              </Flex>
            </Link>
            <Divider borderColor="cje-gray.100" />
          </Box>
        </>
      ) : (
        <CouponCard mode="wallet" />
      )}
      <Box px={8}>
        <Center
          flexDir="column"
          mt={4}
          p={8}
          bgColor="bgGray"
          borderRadius="3xl"
          gap={6}
        >
          <Text fontSize={20} fontWeight={800} textAlign="center">
            {currentUserCoupons && currentUserCoupons.length > 0
              ? "Trouver + de réductions"
              : "Dès qu’une offre vous intéresse, elle sera ici !"}
          </Text>
          <Button
            colorScheme="blackBtn"
            fontWeight={800}
            size="lg"
            rightIcon={<Icon as={HiArrowRight} w={4} h={4} mt={1} />}
            onClick={() => router.push("/dashboard")}
          >
            Voir les réductions
          </Button>
        </Center>
        <Box mt={4} py={8} bgColor="bgGray" borderRadius="2.5xl">
          <TagsSection paginatedTags={[tags ?? []]} />
        </Box>
      </Box>
    </WalletWrapper>
  );
}
