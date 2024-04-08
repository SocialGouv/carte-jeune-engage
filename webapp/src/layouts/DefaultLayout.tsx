import { Box, Container, Flex, useDisclosure } from "@chakra-ui/react";
import Head from "next/head";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect } from "react";
import BottomNavigation from "~/components/BottomNavigation";
import Footer from "~/components/landing/Footer";
import Header from "~/components/landing/Header";
import NotificationModal from "~/components/modals/NotificationModal";
import { BeforeInstallPromptEvent, useAuth } from "~/providers/Auth";

export default function DefaultLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const {
    setDeferredEvent,
    setShowing,
    user,
    isOtpGenerated,
    showNotificationModal,
    setShowNotificationModal,
  } = useAuth();

  const { isOpen: isNotificationModalOpen, onClose: onNotificationModalClose } =
    useDisclosure({
      isOpen: showNotificationModal && !!user && !user.notification_status,
      onClose: () => setShowNotificationModal(false),
    });

  const isLanding =
    (pathname === "/" ||
      pathname === "/cgu" ||
      pathname === "/mentions-legales" ||
      pathname === "/politique-de-confidentialite") &&
    !isOtpGenerated &&
    !user;

  const handleBeforeInstallPrompt = (event: Event) => {
    // Prevent the default behavior to keep the event available for later use
    event.preventDefault();

    // Save the event for later use
    setDeferredEvent(event as BeforeInstallPromptEvent);

    setShowing(true);
  };

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      (window as any)?.workbox !== undefined
    ) {
      // const wb = (window as any)?.workbox;
      // add event listeners to handle PWA lifecycle events
      // console.log("PWA is supported");
      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    }

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, [user]);

  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1,viewport-fit=cover"
        />
        <title>Carte Jeune Engagé</title>
        <meta name="description" content="Carte Jeune Engagé" />
        <link rel="shortcut icon" href="/pwa/appIcon/maskable_icon_x48.png" />
        <link rel="manifest" href="/pwa/manifest.json" />
        <meta name="theme-color" content={isLanding ? "#FFFFFF" : "#F7F7F7"} />
        /* iOS */
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content={isLanding ? "#FFFFFF" : "#F7F7F7"}
        />
        <link
          rel="apple-touch-icon"
          href="/pwa/appIcon/maskable_icon_x192.png"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </Head>
      <Box
        as="main"
        role="main"
        background={isLanding ? "white" : undefined}
        h={isLanding ? "auto" : "full"}
      >
        {isLanding && <Header />}
        <Container
          maxWidth={{
            base: isLanding ? "container.xl" : "container.sm",
          }}
          px={0}
          h="full"
        >
          {children}
          <NotificationModal
            isOpen={isNotificationModalOpen}
            onClose={onNotificationModalClose}
          />
        </Container>
        {isLanding && <Footer />}
        {(pathname === "/dashboard" ||
          pathname === "/dashboard/wallet" ||
          pathname === "/dashboard/categories" ||
          pathname === "/dashboard/account") && <BottomNavigation />}
      </Box>
    </>
  );
}
