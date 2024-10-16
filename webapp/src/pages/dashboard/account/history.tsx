import {
  Box,
  Center,
  Divider,
  Flex,
  Heading,
  Icon,
  IconButton,
  Text,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useAuth } from "~/providers/Auth";
import LoadingLoader from "~/components/LoadingLoader";
import { HiMiniCheckCircle, HiMiniClock } from "react-icons/hi2";
import { api } from "~/utils/api";
import { UserIncluded } from "~/server/api/routers/user";
import Image from "next/image";
import { ChevronLeftIcon } from "@chakra-ui/icons";
import { TinyColor } from "@ctrl/tinycolor";

const UserSavingsNoData = () => {
  return (
    <Box textAlign="center" mt={40}>
      <Text fontWeight="medium" fontSize="sm" px={14}>
        Vous n’avez pas encore utilisé les réductions de votre application.
      </Text>
    </Box>
  );
};

export default function AccountHistory() {
  const router = useRouter();
  const { user } = useAuth();

  const { data: resultUserSavings, isLoading: isLoadingUserSavings } =
    api.saving.getByUserId.useQuery(
      { userId: (user as UserIncluded)?.id },
      { enabled: !!user?.id }
    );

  const { data: userSavings } = resultUserSavings || {};

  if (!user || isLoadingUserSavings || !userSavings)
    return (
      <Center h="full" w="full">
        <LoadingLoader />
      </Center>
    );

  return (
    <Box pt={12} pb={36} px={8}>
      <IconButton
        alignSelf="start"
        shadow="default"
        flexShrink={0}
        aria-label="Retour"
        colorScheme="whiteBtn"
        onClick={() => {
          router.back();
        }}
        borderRadius="2.25xl"
        size="md"
        icon={<ChevronLeftIcon w={6} h={6} color="black" />}
      />
      <Heading as="h2" size="xl" fontWeight={800} mt={6}>
        Historique de mes réductions
      </Heading>
      {userSavings.length > 0 ? (
        <Flex flexDir="column" mt={8}>
          {userSavings.map((userSaving, index) => {
            const currentDate = new Date();
            const currentCouponUsedAt = new Date(
              (userSaving.usedAt
                ? userSaving.usedAt
                : userSaving.offer.validityTo) as string
            );
            const previousCouponUsedAt = userSavings[index - 1]
              ? new Date(
                  (userSavings[index - 1]?.usedAt
                    ? userSavings[index - 1].usedAt
                    : userSavings[index - 1]?.offer.validityTo) as string
                )
              : new Date();

            const currentMonth = currentCouponUsedAt.toLocaleString("fr-FR", {
              month: "long",
            });

            const darkenPartnerColor = new TinyColor(
              userSaving.offer.partner.color
            )
              .darken(10)
              .toHexString();

            const formatedCurrentMonth =
              index === 0 &&
              currentDate.getMonth() === currentCouponUsedAt.getMonth() &&
              currentDate.getFullYear() === currentCouponUsedAt.getFullYear()
                ? "Ce mois-ci"
                : `${
                    currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1)
                  } ${
                    currentDate.getFullYear() !==
                    currentCouponUsedAt.getFullYear()
                      ? currentCouponUsedAt.getFullYear()
                      : ""
                  }`;

            return (
              <>
                {currentCouponUsedAt.getMonth() !==
                  previousCouponUsedAt.getMonth() && (
                  <Text
                    key={currentCouponUsedAt.getMonth()}
                    fontWeight={500}
                    color="disabled"
                    mt={index === 0 ? 0 : 6}
                  >
                    {formatedCurrentMonth}
                  </Text>
                )}
                <Flex
                  key={userSaving.id}
                  alignItems="center"
                  justifyContent="space-between"
                  mt={4}
                >
                  <Flex alignItems="center" gap={2}>
                    <Box
                      borderRadius="2xl"
                      flexShrink={0}
                      bgColor={darkenPartnerColor}
                      p={1.5}
                    >
                      <Image
                        src={userSaving.offer.partner.icon.url as string}
                        alt={userSaving.offer.partner.icon.alt as string}
                        width={36}
                        height={36}
                        style={{ borderRadius: "8px" }}
                      />
                    </Box>
                    <Flex flexDir="column" justifyContent="start" w="full">
                      <Text fontSize={14} fontWeight={500}>
                        {userSaving.offer.partner.name}
                      </Text>
                      <Text fontSize={12} fontWeight={500} noOfLines={1}>
                        {userSaving.offer.title}
                      </Text>
                      <Box mt={1}>
                        {userSaving.used ? (
                          <Flex
                            alignItems="center"
                            fontSize={12}
                            px={1}
                            color="success"
                            bgColor="successLight"
                            w="fit-content"
                            borderRadius="2.5xl"
                            gap={0.5}
                            fontWeight={500}
                          >
                            <Icon
                              as={HiMiniCheckCircle}
                              stroke="white"
                              w={3}
                              h={3}
                            />
                            Déjà utilisée
                          </Flex>
                        ) : (
                          <Flex alignItems="center" color="disabled" gap={0.5}>
                            <Icon as={HiMiniClock} w={3} h={3} />
                            <Text fontWeight={500} fontSize={12}>
                              Fin{" "}
                              {currentCouponUsedAt.toLocaleDateString("fr-FR", {
                                day: "2-digit",
                                month: "2-digit",
                              })}
                            </Text>
                          </Flex>
                        )}
                      </Box>
                    </Flex>
                  </Flex>
                </Flex>
                <Divider mt={2} />
              </>
            );
          })}
        </Flex>
      ) : (
        <UserSavingsNoData />
      )}
    </Box>
  );
}
