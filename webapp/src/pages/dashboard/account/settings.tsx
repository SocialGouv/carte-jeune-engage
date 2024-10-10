import {
  Badge,
  Box,
  Center,
  Divider,
  Flex,
  Heading,
  Icon,
  Text,
} from "@chakra-ui/react";
import { deleteCookie } from "cookies-next";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  HiBuildingLibrary,
  HiMiniPower,
  HiBell,
  HiShieldCheck,
  HiMiniExclamationCircle,
  HiMiniCheckCircle,
} from "react-icons/hi2";
import { IconType } from "react-icons/lib";
import { useAuth } from "~/providers/Auth";
import LoadingLoader from "~/components/LoadingLoader";
import { push } from "@socialgouv/matomo-next";
import BackButton from "~/components/ui/BackButton";
import { TbChevronRight } from "react-icons/tb";

// const CRISP_TOKEN = process.env.NEXT_PUBLIC_CRISP_TOKEN as string;

export default function Account() {
  const router = useRouter();

  const { user } = useAuth();

  // const CrispWithNoSSR = dynamic(
  //   () => import("../../../components/support/Crisp")
  // );

  // const {
  //   data: resultUserSavingTotalAmount,
  //   isLoading: isLoadingUserSavingTotalAmount,
  // } = api.saving.getTotalAmountByUserId.useQuery(
  //   {
  //     userId: (user as UserIncluded)?.id,
  //   },
  //   {
  //     enabled: !!user,
  //   }
  // );

  // const { data: userSavingTotalAmount } = resultUserSavingTotalAmount ?? {};

  // const userCreatedAtFormatted = useMemo(() => {
  //   if (!user) return "";
  //   return new Date(user.createdAt).toLocaleDateString("fr-FR", {
  //     year: "numeric",
  //     month: "long",
  //     day: "numeric",
  //   });
  // }, [user]);

  const menuItems: {
    label: string;
    href?: string;
    onClick?: () => void;
    matomoEvent?: string[];
    icon: IconType;
  }[] = [
    {
      label: "Notifications",
      href: "/dashboard/account/notification",
      icon: HiBell,
    },
    {
      label: "Mentions légales",
      href: "/mentions-legales",
      icon: HiBuildingLibrary,
    },
    {
      label: "Politique de confidentialité",
      href: "/politique-de-confidentialite",
      icon: HiShieldCheck,
    },
  ];

  const handleLogout = async () => {
    await fetch("/api/users/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    deleteCookie(process.env.NEXT_PUBLIC_JWT_NAME ?? "cje-jwt");
    router.reload();
    router.push("/");
  };

  if (!user)
    return (
      <Center h="full" w="full">
        <LoadingLoader />
      </Center>
    );

  return (
    <Flex flexDir="column" pt={12} px={8} h="full">
      <BackButton />
      <Heading as="h2" size="xl" fontWeight="extrabold" mt={6}>
        Réglages
      </Heading>
      {/* <Box textAlign="center" mt={3}>
        <Text fontSize="2xl" fontWeight="extrabold" lineHeight="shorter">
          {user?.firstName},
          <br />
          vous avez économisé
        </Text>
        <Text fontSize="5xl" fontWeight="extrabold">
          {userSavingTotalAmount}€
        </Text>
        <Text fontSize="xs" fontWeight="medium" mt={2}>
          Depuis que vous utilisez la carte jeune : {userCreatedAtFormatted}
        </Text>
      </Box> */}
      <Flex flexDir="column" mt={16}>
        {menuItems.map(({ icon, onClick, label, href, matomoEvent }) => {
          const isItemNotification = href?.split("/").includes("notification");
          const isUserNotificationEnabled =
            user.notification_status === "enabled";
          return (
            <>
              <Link key={icon.toString()} href={href ?? ""}>
                <Flex
                  onClick={() => {
                    if (matomoEvent) push(["trackEvent", ...matomoEvent]);
                    if (onClick) onClick();
                  }}
                  alignItems="center"
                  gap={4}
                  py={4}
                >
                  <Icon as={icon} w={5} h={5} mt="1px" />
                  <Flex flexDir="column" gap={1} w="full">
                    <Flex alignItems="center" justifyContent="space-between">
                      <Text fontWeight={800} noOfLines={1}>
                        {label}
                      </Text>
                      {isItemNotification && (
                        <Flex
                          alignItems="center"
                          gap={0.5}
                          borderRadius="4xl"
                          px={2}
                          py={0.5}
                          bgColor={
                            isUserNotificationEnabled ? "success" : "errorLight"
                          }
                          color={isUserNotificationEnabled ? "white" : "error"}
                        >
                          <Icon
                            as={
                              isUserNotificationEnabled
                                ? HiMiniCheckCircle
                                : HiMiniExclamationCircle
                            }
                            w={3.5}
                            h={3.5}
                          />
                          <Text fontSize={12} fontWeight={700}>
                            {isUserNotificationEnabled ? "Activé" : "Désactivé"}
                          </Text>
                        </Flex>
                      )}
                    </Flex>
                    {isItemNotification && (
                      <Text color="disabled" fontSize={14} fontWeight={500}>
                        {isUserNotificationEnabled
                          ? "Tout est bon, vous n’allez rien manquer"
                          : "Vous risquez de passer à côté de vos réductions"}
                      </Text>
                    )}
                  </Flex>
                  {!isItemNotification && (
                    <Icon as={TbChevronRight} w={5} h={5} mt="1px" ml="auto" />
                  )}
                </Flex>
              </Link>
              <Divider bgColor="disabled" />
            </>
          );
        })}
      </Flex>
      <Flex flexDir="column" mt="auto" mb={18} gap={4}>
        <Text fontSize={14} fontWeight={500} mt={12} color="disabled">
          Version de l'appli carte "jeune engagé" V
          {process.env.NEXT_PUBLIC_CURRENT_PACKAGE_VERSION}
        </Text>
        <Divider bgColor="disabled" />
        <Flex alignItems="center" gap={2} onClick={handleLogout} color="error">
          <Icon as={HiMiniPower} w={5} h={5} mt="1px" />
          <Text
            fontWeight={800}
            textDecoration="underline"
            textDecorationThickness="2px"
            textUnderlineOffset={2}
          >
            Me déconnecter
          </Text>
        </Flex>
      </Flex>
      {/* {isOpenCrisp && user && (
        <CrispWithNoSSR
          crispToken={CRISP_TOKEN}
          user={user}
          onClose={() => {
            setIsOpenCrisp(false);
          }}
        />
      )} */}
    </Flex>
  );
}
