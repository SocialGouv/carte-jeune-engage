import { Button, Text } from "@chakra-ui/react";
import Head from "next/head";
import type { MouseEventHandler } from "react";
import { useEffect, useState } from "react";

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
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null
  );
  const [registration, setRegistration] =
    useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      (window as any).workbox !== undefined
    ) {
      // run only in browser
      navigator.serviceWorker.ready.then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          if (
            sub &&
            !(
              sub.expirationTime &&
              Date.now() > sub.expirationTime - 5 * 60 * 1000
            )
          ) {
            setSubscription(sub);
            setIsSubscribed(true);
          }
        });
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

    const result = await window.Notification.requestPermission();

    if (result !== "granted") {
      console.error("Permission denied.");
      return;
    }

    const sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: base64ToUint8Array(
        process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY
      ),
    });

    // TODO: you should call your API to save subscription data on the server in order to send web push notification from the server
    setSubscription(sub);
    setIsSubscribed(true);
    console.log("Web push subscribed!");
    console.log(sub);
  };

  const unsubscribeButtonOnClick: MouseEventHandler<HTMLButtonElement> = async (
    event
  ) => {
    if (!subscription) {
      console.error("Web push not subscribed");
      return;
    }
    event.preventDefault();
    await subscription.unsubscribe();
    // TODO: you should call your API to delete or invalidate subscription data on the server
    setSubscription(null);
    setIsSubscribed(false);
    console.log("Web push unsubscribed!");
  };

  const sendNotificationButtonOnClick: MouseEventHandler<
    HTMLButtonElement
  > = async (event) => {
    event.preventDefault();
    if (!subscription) {
      console.error("Web push not subscribed");
      return;
    }

    await fetch("/api/notification", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(subscription),
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
        isDisabled={isSubscribed}
      >
        Subscribe
      </Button>
      <Button
        type="button"
        onClick={unsubscribeButtonOnClick}
        isDisabled={!isSubscribed}
      >
        Unsubscribe
      </Button>
      <Button
        type="button"
        onClick={sendNotificationButtonOnClick}
        isDisabled={!isSubscribed}
      >
        Send Notification
      </Button>
      <Text>{registration ? "Subscribed" : "Not subscribed"}</Text>
    </>
  );
};

export default Index;
