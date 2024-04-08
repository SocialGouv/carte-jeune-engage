import { Button, Text } from "@chakra-ui/react";
import Head from "next/head";
import type { MouseEventHandler } from "react";
import { useEffect, useState } from "react";
import { useAuth } from "~/providers/Auth";
import { api } from "~/utils/api";

const base64ToUint8Array = (base64: string) => {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(b64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

const Index = () => {
  const { user, refetchUser } = useAuth();

  const [registration, setRegistration] =
    useState<ServiceWorkerRegistration | null>(null);

  const { mutateAsync: updateUser, isLoading: isLoadingUpdateUser } =
    api.user.update.useMutation();

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      (window as any).workbox !== undefined
    ) {
      // run only in browser
      navigator.serviceWorker.ready.then((reg) => {
        setRegistration(reg);
      });
    }
  }, []);

  const subscribeButtonOnClick: MouseEventHandler<HTMLButtonElement> = async (
    event
  ) => {
    if (!process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY) {
      throw new Error("Environment variables supplied not sufficient.");
    }
    if (!registration) {
      console.error("No SW registration available.");
      return;
    }
    event.preventDefault();
  };

  const sendNotificationButtonOnClick: MouseEventHandler<
    HTMLButtonElement
  > = async (event) => {
    event.preventDefault();
    if (!user || !user.notification_subscription) {
      console.error("Web push not subscribed");
      return;
    }

    await fetch("/api/notification", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(user.notification_subscription),
    });
  };

  return (
    <>
      <Head>
        <title>next-pwa example</title>
      </Head>
      <h1>Next.js + PWA = AWESOME!</h1>
      <Button
        type="button"
        onClick={subscribeButtonOnClick}
        isDisabled={user?.notification_status === "enabled"}
      >
        Subscribe
      </Button>
      <Button
        type="button"
        onClick={sendNotificationButtonOnClick}
        isDisabled={user?.notification_status === "disabled"}
      >
        Send Notification
      </Button>
      <Text>{registration ? "Subscribed" : "Not subscribed"}</Text>
    </>
  );
};

export default Index;
