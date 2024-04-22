import { Flex, Heading, Icon, Switch, Text } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { HiArrowLeft } from "react-icons/hi2";
import { useAuth } from "~/providers/Auth";
import { api } from "~/utils/api";
import { base64ToUint8Array } from "~/utils/tools";

export default function AccountNotifications() {
  const router = useRouter();
  const { user, refetchUser } = useAuth();

  const [notificationPushActive, setNotificationPushActive] = useState(false);

  // const [registration, setRegistration] =
  //   useState<ServiceWorkerRegistration | null>(null);

  const { mutateAsync: updateUser } = api.user.update.useMutation({
    onSuccess: () => refetchUser(),
  });

  // useEffect(() => {
  //   if (
  //     typeof window !== "undefined" &&
  //     "serviceWorker" in navigator &&
  //     (window as any).workbox !== undefined
  //   ) {
  //     // run only in browser
  //     navigator.serviceWorker.ready.then((reg) => {
  //       setRegistration(reg);
  //     });
  //   }
  // }, []);

  const handleRequestNotification = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    let swRegistration = await navigator.serviceWorker.getRegistration();

    if (!swRegistration) {
      console.error("No SW registration available.");
      return;
    }

    if (!event.target.checked) {
      setNotificationPushActive(false);
      updateUser({
        notification_status: "disabled",
        notification_subscription: null,
      });
    } else {
      const sub = await swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: base64ToUint8Array(
          process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY as string
        ),
      });

      await updateUser({
        notification_status: "enabled",
        notification_subscription: sub,
      });

      setNotificationPushActive(true);
    }
  };

  return (
    <Flex flexDir="column" pt={12} px={8} h="full">
      <Icon
        as={HiArrowLeft}
        w={6}
        h={6}
        onClick={() => router.back()}
        cursor="pointer"
      />
      <Heading
        as="h2"
        size="lg"
        fontWeight="extrabold"
        mt={4}
        textAlign="center"
      >
        Mes notifications
      </Heading>
      {user && (
        <Flex flexDir="column" mt={10} gap={6}>
          <Flex alignItems="center" justifyContent="space-between" gap={1}>
            <Text fontWeight="medium">Autoriser les notifications push</Text>
            <Switch
              defaultChecked={user?.notification_status === "enabled"}
              onChange={handleRequestNotification}
              checked={notificationPushActive}
            />
          </Flex>
        </Flex>
      )}
    </Flex>
  );
}