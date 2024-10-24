import {
  Center,
  Flex,
  Modal,
  ModalBody,
  ModalContent,
  Text,
} from "@chakra-ui/react";
import { useAuth } from "~/providers/Auth";
import Image from "next/image";
import { useEffect } from "react";
import { useRouter } from "next/router";

const SplashScreenModal = ({
  onClose,
  isOpen,
}: {
  onClose: () => void;
  isOpen: boolean;
}) => {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      router.push("/dashboard").then(() => {
        onClose();
      });
    }, 1200);

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full">
      <ModalContent bgColor="primary">
        <ModalBody
          display="flex"
          flexDir="column"
          color="white"
          justifyContent="center"
          mb={40}
        >
          <Center h="full">
            <Flex
              flexDir="column"
              alignItems="center"
              justifyContent="center"
              textAlign="center"
              gap={4}
              mb={20}
            >
              <Image
                src="/images/cje-logo-white-blue.svg"
                alt="Carte Jeune Engagé"
                width={141}
                height={75}
              />
              <Text fontWeight="extrabold" color="white" mt={20} fontSize={32}>
                Ca y est {user?.firstName} !
                <br />
                Les réductions sont à vous
              </Text>
            </Flex>
          </Center>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default SplashScreenModal;
