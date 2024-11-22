import {
  Center,
  Flex,
  Heading,
  Modal,
  ModalBody,
  ModalContent,
  Text,
} from "@chakra-ui/react";
import { useAuth } from "~/providers/Auth";
import { api } from "~/utils/api";
import { base64ToUint8Array } from "~/utils/tools";
import LoadingLoader from "../LoadingLoader";
import { useEffect } from "react";

const NotificationModalContent = ({
  isServiceWorkerAvailable,
  onClose,
  handleRequestNotification,
}: {
  isServiceWorkerAvailable: boolean;
  onClose: () => void;
  handleRequestNotification: () => void;
}) => {
  if (!isServiceWorkerAvailable) {
    return (
      <Center h="full">
        <LoadingLoader />
      </Center>
    );
  }

  return (
    <>
      <Heading size="lg" fontWeight="extrabold" textAlign="center">
        Ne ratez pas les
        <br />
        nouvelles réductions
      </Heading>
      <Flex flexDir="column" bgColor="white" borderRadius="2.25xl">
        <Flex
          flexDir="column"
          textAlign="center"
          py={5}
          px={3.5}
          color="black"
          gap={1.5}
        >
          <Text fontWeight={700}>
            Autorisez vous Carte “jeune engagé” à vous envoyer des notifications
            ?
          </Text>
          <Text fontSize={14}>
            Les notification peuvent inclure des alertes, des sons et des
            pastilles d’icône. Vous pouvez les configurer dans vos Réglages.
          </Text>
        </Flex>
        <Flex borderTopWidth={1} borderTopColor="cje-gray.400" fontWeight={800}>
          <Center
            flex={1}
            py={4}
            bgColor="blackBtn"
            borderBottomLeftRadius="2.25xl"
            onClick={onClose}
          >
            <Text color="disabled">Refuser</Text>
          </Center>
          <Center
            flex={1}
            py={4}
            bgColor="primary"
            borderBottomRightRadius="2.25xl"
            onClick={handleRequestNotification}
          >
            <Text>Autoriser</Text>
          </Center>
        </Flex>
      </Flex>
    </>
  );
};

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

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!serviceWorkerRegistration) {
        onClose();
      }
    }, 2000);

    return () => clearTimeout(timeout);
  }, [serviceWorkerRegistration]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full">
      <ModalContent bgColor="black">
        <ModalBody
          display="flex"
          flexDir="column"
          color="white"
          justifyContent="center"
          mb={40}
          gap={12}
          px={16}
        >
          <NotificationModalContent
            isServiceWorkerAvailable={!!serviceWorkerRegistration}
            onClose={onClose}
            handleRequestNotification={handleRequestNotification}
          />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default NotificationModal;
