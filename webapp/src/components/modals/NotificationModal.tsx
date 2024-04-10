import { Button, Flex, Heading, Image } from "@chakra-ui/react";
import BaseModal from "./BaseModal";
import StackItems from "../offer/StackItems";
import { useAuth } from "~/providers/Auth";
import { useEffect, useState } from "react";
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

const NotificationModal = ({
  onClose,
  isOpen,
}: {
  onClose: () => void;
  isOpen: boolean;
}) => {
  const { refetchUser } = useAuth();

  const [registration, setRegistration] =
    useState<ServiceWorkerRegistration | null>(null);

  const { mutateAsync: updateUser } = api.user.update.useMutation({
    onSuccess: () => refetchUser(),
  });

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

  const handleRequestNotification = async () => {
    if (!registration) {
      console.error("No SW registration available.");
      return;
    }

    const result = await window.Notification.requestPermission();

    if (result !== "granted") {
      updateUser({
        notification_status: "disabled",
      });
      onClose();
    }

    const sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: base64ToUint8Array(
        process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY as string
      ),
    });

    await updateUser({
      notification_status: "enabled",
      notification_subscription: sub,
    });

    onClose();
  };

  return (
    <BaseModal
      onClose={onClose}
      isOpen={isOpen}
      hideCloseBtn={true}
      pb={6}
      heightModalContent="full"
    >
      <Flex flexDir="column" h="full">
        <Flex flexDir="column" my="auto">
          <Image
            src="/images/notification-modal-header.png"
            alt="Notification modal header"
            w="full"
            h="auto"
            maxH={140}
            objectFit="contain"
          />
          <Heading size="lg" fontWeight="extrabold" textAlign="center" mt={10}>
            Ne manquez aucune des
            <br />
            nouvelles offres en activant
            <br />
            les notifications
          </Heading>
          <StackItems
            props={{ mt: 8 }}
            items={[
              {
                icon: "HiCheckCircle",
                text: "Pas de notif inutile",
              },
              {
                icon: "HiTicket",
                text: "On vous rappelle vos offres à utiliser",
              },
              {
                icon: "HiTicket",
                text: "Dès qu’une nouvelle offre arrive, vous êtes au courant",
              },
            ]}
          />
        </Flex>
        <Flex flexDir="column" mt="auto">
          <Button colorScheme="blackBtn" onClick={handleRequestNotification}>
            Activer les notifications
          </Button>
          <Button
            colorScheme="transparent"
            mt={2}
            color="blackBtn.500"
            onClick={onClose}
          >
            Plus tard
          </Button>
        </Flex>
      </Flex>
    </BaseModal>
  );
};

export default NotificationModal;