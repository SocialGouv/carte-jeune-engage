import { Box, Container, useDisclosure } from "@chakra-ui/react";
import Head from "next/head";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect } from "react";
import BottomNavigation from "~/components/BottomNavigation";
import Footer from "~/components/landing/Footer";
import Header from "~/components/landing/Header";
import NotificationModal from "~/components/modals/NotificationModal";
import { BeforeInstallPromptEvent, useAuth } from "~/providers/Auth";
import { push } from "@socialgouv/matomo-next";
import SplashScreenModal from "~/components/modals/SplashScreenModal";
import { isIOS } from "~/utils/tools";
import { useRouter } from "next/router";

export default function DefaultLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const {
    setDeferredEvent,
    setShowing,
    user,
    isOtpGenerated,
    showNotificationModal,
    setShowNotificationModal,
    showSplashScreenModal,
    setShowSplashScreenModal,
    setServiceWorkerRegistration,
  } = useAuth();

  const { isOpen: isNotificationModalOpen, onClose: onNotificationModalClose } =
    useDisclosure({
      isOpen:
        showNotificationModal &&
        !!user &&
        !user.notification_status &&
        !isIOS(),
      onClose: () => {
        setShowNotificationModal(false);
        setShowSplashScreenModal(true);
      },
    });

  const { isOpen: isSplashscreenModalOpen, onClose: onSplashscreenModalClose } =
    useDisclosure({
      isOpen: showSplashScreenModal,
      onClose: () => setShowSplashScreenModal(false),
    });

  const isPublicPage =
    pathname === "/" ||
    pathname === "/partners" ||
    pathname === "/login" ||
    pathname === "/maintenance";

  const isLegalPage =
    pathname === "/cgu" ||
    pathname === "/mentions-legales" ||
    pathname === "/politique-de-confidentialite";

  const isLanding = isPublicPage || isLegalPage;
  // && !isOtpGenerated && !user;

  const handleBeforeInstallPrompt = (event: Event) => {
    // Prevent the default behavior to keep the event available for later use
    event.preventDefault();

    // Save the event for later use
    setDeferredEvent(event as BeforeInstallPromptEvent);

    setShowing(true);
  };

  const getTarteAuCitronInitByEnv = () => {
    switch (process.env.NEXT_PUBLIC_ENV_APP) {
      case "preproduction":
        return (
          <script
            type="text/javascript"
            src="/static/tarteaucitron/env/preprod/initTarteaucitron.js"
          />
        );
      case "production":
        return (
          <script
            type="text/javascript"
            src="/static/tarteaucitron/env/prod/initTarteaucitron.js"
          />
        );
    }
  };

  useEffect(() => {
    if (user && isPublicPage) {
      router.replace("/dashboard");
    }
  }, [user]);

  useEffect(() => {
    const handleHotjarAllowed = () =>
      push(["trackEvent", "Landing", "Hotjar accepté"]);

    document.addEventListener("hotjar_allowed", handleHotjarAllowed);

    return () => {
      document.removeEventListener("hotjar_allowed", handleHotjarAllowed);
    };
  }, []);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      window.serwist !== undefined
    ) {
      // run only in browser
      navigator.serviceWorker.ready.then((reg) => {
        setServiceWorkerRegistration(reg);
      });
    }
  }, []);

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
        /* Tarteaucitron */
        <script
          type="text/javascript"
          src="/static/tarteaucitron/tarteaucitron.js"
        />
        {getTarteAuCitronInitByEnv()}
      </Head>
      <Box
        as="main"
        role="main"
        background={isLanding ? "white" : undefined}
        h={isLanding ? "auto" : "full"}
        overflowX={isLanding ? "hidden" : undefined}
      >
        {isLanding && pathname !== "/login" && <Header />}
        <Container
          maxWidth={{
            base: isLanding ? "container.xl" : "container.sm",
          }}
          px={0}
          h="full"
        >
          {children}
          {showSplashScreenModal && (
            <SplashScreenModal
              isOpen={isSplashscreenModalOpen}
              onClose={onSplashscreenModalClose}
            />
          )}
          {showNotificationModal && (
            <NotificationModal
              isOpen={isNotificationModalOpen}
              onClose={onNotificationModalClose}
            />
          )}
        </Container>
        {isLanding && <Footer />}
        {(pathname === "/dashboard" ||
          pathname === "/dashboard/wallet" ||
          pathname === "/dashboard/search") && <BottomNavigation />}
      </Box>
    </>
  );
}
