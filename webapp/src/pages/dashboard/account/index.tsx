import { Box, Center, Flex, Icon, Text } from "@chakra-ui/react";
import { deleteCookie } from "cookies-next";
import Link from "next/link";
import { useRouter } from "next/router";
import { User } from "~/payload/payload-types";
import { useMemo, useState } from "react";
import {
  HiBuildingLibrary,
  HiChatBubbleOvalLeftEllipsis,
  HiCurrencyEuro,
  HiExclamationTriangle,
  HiCheckBadge,
  HiMiniChevronRight,
  HiMiniPower,
  HiUser,
  HiUserCircle,
  HiShieldCheck,
  HiBookOpen,
  HiMiniShieldCheck,
  HiBell,
} from "react-icons/hi2";
import { IconType } from "react-icons/lib";
import InstallationBanner from "~/components/InstallationBanner";
import { useAuth } from "~/providers/Auth";
import LoadingLoader from "~/components/LoadingLoader";
import { api } from "~/utils/api";
import { UserIncluded } from "~/server/api/routers/user";
import NewPassComponent from "~/components/NewPassComponent";
import dynamic from "next/dynamic";
import { push } from "@socialgouv/matomo-next";
import { isIOS } from "~/utils/tools";

const CRISP_TOKEN = process.env.NEXT_PUBLIC_CRISP_TOKEN as string;

const displayDynamicCJECardMessage = (user: User) => {
  if (!user.image) {
    return (
      <>
        <Flex alignItems="center" color="error">
          <Icon as={HiExclamationTriangle} w={5} h={5} mr={1.5} />
          <Text fontSize="xs" fontWeight="bold">
            Photo manquante
          </Text>
        </Flex>
        <Text fontSize="sm" fontWeight="medium">
          Finalisez votre carte CJE pour profiter des offres en magasin
        </Text>
      </>
    );
  } else if (user.image && user.status_image === "pending") {
    return (
      <>
        <Flex alignItems="center" color="primary.500">
          <Icon as={HiShieldCheck} w={5} h={5} mr={1.5} />
          <Text fontSize="xs" fontWeight="bold">
            Notre équipe est en train de créer votre carte...
          </Text>
        </Flex>
      </>
    );
  }

  return (
    <>
      <Text fontSize="sm" fontWeight="medium">
        À présenter pour bénéficier des réductions en magasin
      </Text>
      <Flex alignItems="center" color="primary.500">
        <Icon as={HiCheckBadge} w={5} h={5} mr={1.5} />
        <Text fontSize="xs" fontWeight="bold">
          Carte vérifiée
        </Text>
      </Flex>
    </>
  );
};

export default function Account() {
  const router = useRouter();

  const { user } = useAuth();

  const CrispWithNoSSR = dynamic(
    () => import("../../../components/support/Crisp")
  );

  const [isOpenNewPassComponent, setIsOpenNewPassComponent] = useState(false);
  const [isOpenCrisp, setIsOpenCrisp] = useState(false);

  const {
    data: resultUserSavingTotalAmount,
    isLoading: isLoadingUserSavingTotalAmount,
  } = api.saving.getTotalAmountByUserId.useQuery(
    {
      userId: (user as UserIncluded)?.id,
    },
    {
      enabled: !!user,
    }
  );

  const { data: userSavingTotalAmount } = resultUserSavingTotalAmount ?? {};

  const userCreatedAtFormatted = useMemo(() => {
    if (!user) return "";
    return new Date(user.createdAt).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [user]);

  const itemsPrimary: {
    label: string;
    href?: string;
    onClick?: () => void;
    matomoEvent?: string[];
    icon: IconType;
    slug: string;
  }[] = [
    {
      label: "Suivre mes économies",
      href: "/dashboard/account/history",
      icon: HiCurrencyEuro,
      slug: "history",
      matomoEvent: ["Profil", "Suivre mes économies"],
    },
    {
      label: "Ma carte CJE",
      href:
        user?.image && user?.status_image === "approved"
          ? "/dashboard/account/card"
          : undefined,
      onClick: !user?.image
        ? () => {
            push(["trackEvent", "Profil", "Ma carte CJE"]);
            setIsOpenNewPassComponent(true);
          }
        : undefined,
      icon: HiUserCircle,
      slug: "card",
      matomoEvent: ["Profil", "Ma carte CJE"],
    },
    {
      label: "J'ai besoin d'aide",
      onClick: () => {
        setIsOpenCrisp(true);
      },
      icon: HiChatBubbleOvalLeftEllipsis,
      slug: "help",
      matomoEvent: ["Profil", "J'ai besoin d'aide"],
    },
  ];

  const itemsSecondary: {
    label: string;
    href?: string;
    icon: IconType;
    iconColor?: string;
    onClick?: () => void;
  }[] = [
    {
      label: "Informations personnelles",
      href: "/dashboard/account/information",
      icon: HiUser,
    },
    {
      label: "Gérer mes notifications",
      href: "/dashboard/account/notification",
      icon: HiBell,
    },
    {
      label: "Mentions légales",
      href: "/mentions-legales",
      icon: HiBuildingLibrary,
    },
    {
      label: "Conditions d'utilisation",
      href: "/cgu",
      icon: HiBookOpen,
    },
    {
      label: "Politique de confidentialité",
      href: "/politique-de-confidentialite",
      icon: HiMiniShieldCheck,
    },
    {
      label: "Me déconnecter",
      onClick: () => handleLogout(),
      icon: HiMiniPower,
      iconColor: "error",
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

  if (
    !user ||
    isLoadingUserSavingTotalAmount ||
    userSavingTotalAmount === undefined
  )
    return (
      <Center h="full" w="full">
        <LoadingLoader />
      </Center>
    );

  return (
    <Box pt={12} pb={36} px={8}>
      <Box textAlign="center">
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
      </Box>
      <Flex flexDir="column" mt={8} mb={6} gap={4}>
        {itemsPrimary.map((item) => (
          <Link href={item.href ?? ""} key={item.icon.toString()} color="blue">
            <Flex
              onClick={() => {
                if (item.matomoEvent) push(["trackEvent", ...item.matomoEvent]);
                if (item.onClick) item.onClick();
              }}
              alignItems="start"
              gap={4}
              bgColor="cje-gray.500"
              p={4}
              borderRadius="1.5xl"
            >
              <Flex bgColor="blackLight" p={1} borderRadius="lg">
                <Icon as={item.icon} fill="white" w={6} h={6} />
              </Flex>
              <Flex flexDir="column" gap={2} mt={1}>
                <Text fontWeight="bold" noOfLines={1}>
                  {item.label}
                </Text>
                {item.slug === "card" && displayDynamicCJECardMessage(user)}
              </Flex>
              {item.slug === "card" && user.status_image !== "approved" && (
                <Box w={8} mt={3}>
                  <Box
                    borderRadius="full"
                    w={2}
                    h={2}
                    bgColor={!user.image ? "error" : "primary.500"}
                    ml="auto"
                  />
                </Box>
              )}
            </Flex>
          </Link>
        ))}
      </Flex>
      <InstallationBanner
        ignoreUserOutcome={true}
        theme="dark"
        matomoEvent={["Profil", "Obtenir l'application"]}
      />
      <Flex flexDir="column" mt={8} gap={8} px={5}>
        {itemsSecondary.map((item) => {
          if (item.href === "/dashboard/account/notification" && isIOS())
            return;
          return (
            <Link
              href={item.href ?? ""}
              key={item.icon.toString()}
              onClick={item.onClick}
              color="blue"
            >
              <Flex alignItems="center" gap={4}>
                <Icon as={item.icon} color={item.iconColor} w={6} h={6} />
                <Text fontSize="sm" fontWeight="bold" noOfLines={1}>
                  {item.label}
                </Text>
                <Icon as={HiMiniChevronRight} w={6} h={6} ml="auto" />
              </Flex>
            </Link>
          );
        })}
      </Flex>
      <Text fontSize="xs" fontWeight="medium" textAlign="center" mt={12}>
        Version appli beta test V
        {process.env.NEXT_PUBLIC_CURRENT_PACKAGE_VERSION}
      </Text>
      <NewPassComponent
        isOpen={isOpenNewPassComponent}
        onClose={() => setIsOpenNewPassComponent(false)}
      />
      {isOpenCrisp && user && (
        <CrispWithNoSSR
          crispToken={CRISP_TOKEN}
          user={user}
          onClose={() => {
            setIsOpenCrisp(false);
          }}
        />
      )}
    </Box>
  );
}
