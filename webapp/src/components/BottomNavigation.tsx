import { Flex, Icon, SimpleGrid, Text } from "@chakra-ui/react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { HiOutlineTag, HiTag } from "react-icons/hi2";
import { push } from "@socialgouv/matomo-next";
import { ReductionIcon, ReductionOutlineIcon } from "./Icons";
import { CgSearch } from "react-icons/cg";

const BottomNavigation = () => {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const updatePadding = () => {
      const computedStyle = getComputedStyle(document.body);

      const safeAreaInsetBottom = computedStyle.getPropertyValue(
        "--safe-area-inset-bottom"
      );

      const bottomNavigation = document.getElementById("cje-bottom-navigation");

      if (bottomNavigation)
        bottomNavigation.style.paddingBottom =
          safeAreaInsetBottom !== "0px" ? safeAreaInsetBottom : "20px";
    };

    updatePadding();
    window.addEventListener("resize", updatePadding);

    return () => window.removeEventListener("resize", updatePadding);
  }, []);

  const navigationItems = [
    {
      label: "Mes réductions",
      icon: ReductionOutlineIcon,
      activeIcon: ReductionIcon,
      href: "/dashboard/wallet",
      matomoEvent: ["Navigation", "Mes réductions"],
    },
    {
      label: "Offres",
      icon: HiOutlineTag,
      activeIcon: HiTag,
      href: "/dashboard",
      matomoEvent: ["Navigation", "Accueil (Offres)"],
    },
    {
      label: "Rechercher",
      icon: CgSearch,
      activeIcon: CgSearch,
      href: "/dashboard/categories",
      matomoEvent: ["Navigation", "Rechercher"],
    },
  ];

  return (
    <SimpleGrid
      id="cje-bottom-navigation"
      columns={navigationItems.length}
      borderTopRadius={24}
      bgColor="white"
      position="fixed"
      bottom={0}
      left={0}
      right={0}
      pt={5}
      px={10}
    >
      {navigationItems.map(({ href, label, icon, activeIcon, matomoEvent }) => (
        <Flex
          key={label}
          flexDir="column"
          alignItems="center"
          gap={0.5}
          cursor="pointer"
          onClick={() => {
            push(["trackEvent", ...matomoEvent]);
            router.push(href);
          }}
        >
          <Icon
            as={pathname === href ? activeIcon : icon}
            color="blackLight"
            width={6}
            height={6}
          />
          <Text fontSize={12} fontWeight={500} color="blackLight">
            {label}
          </Text>
        </Flex>
      ))}
    </SimpleGrid>
  );
};

export default BottomNavigation;
