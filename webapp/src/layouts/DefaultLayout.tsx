import { Box, Container } from "@chakra-ui/react";
import Head from "next/head";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect } from "react";
import BottomNavigation from "~/components/BottomNavigation";
import { BeforeInstallPromptEvent, useAuth } from "~/providers/Auth";

export default function DefaultLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const { setDeferredEvent, setShowing, user } = useAuth();

  const handleBeforeInstallPrompt = (event: Event) => {
    // Prevent the default behavior to keep the event available for later use
    event.preventDefault();

    // // Save the event for later use
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
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>Carte Jeune Engagé</title>
        <meta name="description" content="Carte Jeune Engagé" />
        <link rel="shortcut icon" href="/pwa/appIcon/maskable_icon_x48.png" />
        <link rel="manifest" href="/pwa/manifest.json" />
        <meta name="theme-color" content="#F7F7F7" />
        /* iOS */
        <meta name="apple-mobile-web-app-status-bar-style" content="#F7F7F7" />
        <link
          rel="apple-touch-icon"
          href="/pwa/appIcon/maskable_icon_x192.png"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </Head>
      <Box as="main" role="main">
        <Container
          maxWidth={{ base: "container.sm", lg: "container.sm" }}
          px={0}
          h="full"
        >
          {children}
        </Container>
        {(pathname === "/dashboard" ||
          pathname === "/dashboard/wallet" ||
          pathname === "/dashboard/categories" ||
          pathname === "/dashboard/account") && <BottomNavigation />}
      </Box>
    </>
  );
}
