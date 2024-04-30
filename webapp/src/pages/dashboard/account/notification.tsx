import { Button, Flex, Heading, Icon, Switch, Text } from "@chakra-ui/react";
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

  const { mutateAsync: updateUser } = api.user.update.useMutation({
    onSuccess: () => refetchUser(),
  });

  const handleRequestNotification = async (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    if (user?.notification_status === "enabled") {
      await updateUser({
        notification_subscription: null,
        notification_status: "disabled",
      });
    } else {
      let swRegistration;

      if ("serviceWorker" in navigator) {
        swRegistration = await navigator.serviceWorker.getRegistration();
        if (!swRegistration)
          swRegistration = await (window as any).workbox.register();

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
            <Button onClick={handleRequestNotification}>
              {user.notification_status === "enabled"
                ? "Désactiver"
                : "Activer"}
            </Button>
          </Flex>
        </Flex>
      )}
    </Flex>
  );
}
