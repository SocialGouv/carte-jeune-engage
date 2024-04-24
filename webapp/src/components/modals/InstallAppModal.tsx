import {
  Box,
  Button,
  Flex,
  Heading,
  Icon,
  Image,
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import BaseModal from "./BaseModal";
import StackItems from "../offer/StackItems";
import { useAuth } from "~/providers/Auth";
import { isIOS } from "~/utils/tools";
import { useLocalStorage } from "usehooks-ts";
import { MdIosShare, MdOutlineAddBox } from "react-icons/md";

const InstallAppModal = ({
  onClose,
  isOpen,
}: {
  onClose: () => void;
  isOpen: boolean;
}) => {
  const { deferredEvent, setDeferredEvent, setShowing } = useAuth();

  const {
    isOpen: isOpenIosModal,
    onOpen: onOpenIosModal,
    onClose: onCloseIosModal,
  } = useDisclosure();

  const [_, setUserOutcome] = useLocalStorage<"accepted" | "dismissed" | null>(
    "cje-pwa-user-outcome",
    null
  );

  const handleInstallApp = async () => {
    if (deferredEvent && !isIOS()) {
      await deferredEvent.prompt();
      const { outcome } = await deferredEvent.userChoice;
      setUserOutcome(outcome);
      setDeferredEvent(null);
      setShowing(false);
      onClose();
    } else {
      onOpenIosModal();
    }
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
        <Image
          src="/images/app-phone.png"
          alt="Activation de l'offre"
          w="full"
          h="auto"
          maxH={500}
          objectFit="contain"
        />
        <Heading size="lg" fontWeight="extrabold" textAlign="center" mt={10}>
          Ajoutez l’appli
          <br />
          carte “jeune engagé”
          <br />
          sur votre écran d’accueil
        </Heading>
        <StackItems
          props={{ mt: 6 }}
          items={[
            {
              icon: "HiCheck",
              text: "Retrouvez l’appli tout le temps sur votre téléphone",
            },
            {
              icon: "HiCheck",
              text: "Trouvez vos codes de réductions plus rapidement",
            },
          ]}
        />
        <Box mt="auto">
          <Flex flexDir="column" mt={8}>
            <Button colorScheme="blackBtn" onClick={handleInstallApp}>
              Ajouter l’appli maintenant
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
        </Box>
      </Flex>
      <Modal isOpen={isOpenIosModal} onClose={onCloseIosModal} size="md">
        <ModalOverlay />
        <ModalContent
          mx={8}
          p={6}
          my="auto"
          borderRadius="2xl"
          textAlign="center"
          gap={6}
        >
          <ModalCloseButton />
          <Image
            mt={8}
            src="/images/ios-install-app.png"
            alt="Ios install app"
            w="full"
            h="auto"
            maxH={270}
            objectFit="contain"
          />
          <Text fontWeight="medium" color="secondaryText">
            Pour installer l’application il n’y a
            <br />
            qu’à suivre ces 2 petites étapes
          </Text>
          <Flex alignItems="center" justifyContent="center">
            <Text fontSize="lg" fontWeight="medium">
              Cliquer sur l’icône
            </Text>
            <Icon as={MdIosShare} w={6} h={6} ml={2} />
          </Flex>
          <Text fontWeight="medium" color="secondaryText">
            Faites défiler vers le bas puis
            <br />
            cliquez sur :
          </Text>
          <Flex alignItems="center" justifyContent="center">
            <Text fontSize="lg" fontWeight="medium">
              Ajouter à l’écran d’accueil
            </Text>
            <Icon as={MdOutlineAddBox} w={6} h={6} ml={2} />
          </Flex>
          <Button type="button" onClick={onClose}>
            Continuer
          </Button>
        </ModalContent>
      </Modal>
    </BaseModal>
  );
};

export default InstallAppModal;
