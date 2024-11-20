import {
  Center,
  Flex,
  Modal,
  ModalBody,
  ModalContent,
  Text,
} from "@chakra-ui/react";
import Image from "next/image";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { UserIncluded } from "~/server/api/routers/user";
import { useAuth } from "~/providers/Auth";

const SplashScreenModal = ({
  onClose,
  isOpen,
}: {
  onClose: () => void;
  isOpen: boolean;
}) => {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const cjeRedirectionOfferId = localStorage.getItem(
      "cje-widget-redirection-offer-id"
    );
    const timeoutId = setTimeout(() => {
      router
        .push(
          cjeRedirectionOfferId
            ? `/dashboard/offer/${cjeRedirectionOfferId}`
            : "/dashboard"
        )
        .then(() => {
          localStorage.removeItem("cje-widget-redirection-offer-id");
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
                {user?.userEmail ? (
                  <>De nouvelles réductions vous attendent !</>
                ) : (
                  <>
                    Ca y est {user?.firstName} !
                    <br />
                    Les réductions sont à vous
                  </>
                )}
              </Text>
            </Flex>
          </Center>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default SplashScreenModal;
