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
import TagsList from "~/components/lists/TagsList";
import Image from "next/image";
import { CouponIncluded } from "~/server/api/routers/coupon";
import { OrderIncluded } from "~/server/api/routers/order";
import OrderCard from "~/components/cards/OrderCard";

export default function Wallet() {
  const router = useRouter();

  const { data: resultOffers, isLoading: isLoadingOffers } =
    api.offer.getListOfAvailables.useQuery({
      page: 1,
      perPage: 1000,
    });

  const { data: resultUserCoupons, isLoading: isLoadingUserCoupons } =
    api.coupon.getList.useQuery();
  const { data: resultUserOrders, isLoading: isLoadingUserOrders } =
    api.order.getList.useQuery();

  const { data: currentUserCoupons } = resultUserCoupons || { data: [] };
  const { data: currentUserOrders } = resultUserOrders || { data: [] };
  const { data: offers } = resultOffers || { data: [] };

  if (isLoadingUserCoupons || isLoadingOffers || isLoadingUserOrders)
    return (
      <WalletWrapper>
        <Center h="85%" w="full">
          <LoadingLoader />
        </Center>
      </WalletWrapper>
    );

  const walletOffers: (CouponIncluded | OrderIncluded)[] = [
    ...currentUserCoupons,
    ...currentUserOrders,
  ].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <WalletWrapper>
      {walletOffers && walletOffers.length > 0 ? (
        <>
          <Flex flexDir="column" gap={6}>
            {walletOffers.map((walletOffer, index) => (
              <Box
                mt={index !== 0 ? -16 : 0}
                bgColor="white"
                w="full"
                pt={index !== 0 ? 3 : 0}
                zIndex={1}
                borderTopWidth={index !== 0 ? 1 : 0}
                px={8}
              >
                {"code" in walletOffer ? (
                  <CouponCard
                    key={walletOffer.id}
                    coupon={walletOffer}
                    link={`/dashboard/offer/cje/${walletOffer.offer.id}?offerKind=coupon`}
                    mode="wallet"
                  />
                ) : (
                  <OrderCard key={walletOffer.id} order={walletOffer} />
                )}
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
        <Box px={8}>
          <CouponCard mode="wallet" />
        </Box>
      )}
      <Box px={8}>
        <Center
          flexDir="column"
          mt={4}
          py={8}
          px={10}
          bgColor="bgGray"
          borderRadius="3xl"
        >
          <Text fontSize={20} fontWeight={800} textAlign="center" mb={8}>
            {currentUserCoupons && currentUserCoupons.length > 0
              ? "Trouver + de réductions"
              : "Dès qu’une offre vous intéresse, elle sera ici !"}
          </Text>
          <Image
            src="/images/dashboard/offer-cards.png"
            alt="Cartes d'offres"
            width={0}
            height={0}
            sizes="100vw"
            style={{
              width: "100%",
              height: "111px",
              marginBottom: "-36px",
              marginLeft: "10px",
            }}
          />
          <Button
            colorScheme="blackBtn"
            fontWeight={800}
            size="lg"
            fontSize={14}
            rightIcon={<Icon as={HiArrowRight} w={4} h={4} mt={1} />}
            onClick={() => router.push("/dashboard")}
          >
            Voir les réductions
          </Button>
        </Center>
        <Box mt={4} py={8} bgColor="bgGray" borderRadius="2.5xl">
          <TagsList offers={offers} />
        </Box>
      </Box>
    </WalletWrapper>
  );
}
