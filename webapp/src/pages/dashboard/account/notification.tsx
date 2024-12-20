import { Button, Center, Flex, Heading, Icon, Text } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useState } from "react";
import { HiArrowLeft } from "react-icons/hi2";
import LoadingLoader from "~/components/LoadingLoader";
import BackButton from "~/components/ui/BackButton";
import { useAuth } from "~/providers/Auth";
import { api } from "~/utils/api";
import { base64ToUint8Array } from "~/utils/tools";

export default function AccountNotifications() {
  const router = useRouter();
  const { user, refetchUser, serviceWorkerRegistration } = useAuth();

  const [isLoading, setIsLoading] = useState(false);

  const { mutateAsync: updateUser } = api.user.update.useMutation({
    onSuccess: () => refetchUser(),
  });

  const handleRequestNotification = async () => {
    setIsLoading(true);
    if (user?.notification_status === "enabled") {
      await updateUser({
        notification_subscription: null,
        notification_status: "disabled",
      });
    } else {
      if (!serviceWorkerRegistration) {
        console.error("No SW registration available.");
        return;
      }

      const sub = await serviceWorkerRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: base64ToUint8Array(
          process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY as string
        ),
      });

      await updateUser({
        notification_status: "enabled",
        notification_subscription: sub,
      });
    }
    setIsLoading(false);
  };

  const WrapperNotification = ({ children }: { children: React.ReactNode }) => {
    return (
      <Flex flexDir="column" pt={12} px={8} h="full">
        <BackButton />
        <Heading as="h2" size="xl" fontWeight={800} mt={6}>
          Mes notifications
        </Heading>
        {children}
      </Flex>
    );
  };

  if (!serviceWorkerRegistration) {
    return (
      <WrapperNotification>
        <Center h="25%">
          <LoadingLoader />
        </Center>
      </WrapperNotification>
    );
  }

  return (
    <WrapperNotification>
      {user && (
        <Flex flexDir="column" mt={10} gap={6}>
          <Flex alignItems="center" justifyContent="space-between" gap={1}>
            <Text fontWeight="medium">Autoriser les notifications push</Text>
            <Button onClick={handleRequestNotification} isLoading={isLoading}>
              {user.notification_status === "enabled"
                ? "Désactiver"
                : "Activer"}
            </Button>
          </Flex>
        </Flex>
      )}
    </WrapperNotification>
  );
}
