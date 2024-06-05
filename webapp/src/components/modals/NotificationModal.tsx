import { Button, Center, Flex, Heading, Image } from "@chakra-ui/react";
import BaseModal from "./BaseModal";
import StackItems from "../offer/StackItems";
import { useAuth } from "~/providers/Auth";
import { api } from "~/utils/api";
import { base64ToUint8Array } from "~/utils/tools";
import LoadingLoader from "../LoadingLoader";

const NotificationModal = ({
  onClose,
  isOpen,
}: {
  onClose: () => void;
  isOpen: boolean;
}) => {
  const { refetchUser, serviceWorkerRegistration } = useAuth();

  const { mutateAsync: updateUser } = api.user.update.useMutation({
    onSuccess: () => refetchUser(),
  });

  const handleRequestNotification = async () => {
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

    refetchUser();
    onClose();
  };

  if (!serviceWorkerRegistration) {
    return (
      <BaseModal
        onClose={onClose}
        isOpen={isOpen}
        hideCloseBtn={true}
        pb={6}
        heightModalContent="full"
      >
        <Center h="full">
          <LoadingLoader />
        </Center>
      </BaseModal>
    );
  }

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
