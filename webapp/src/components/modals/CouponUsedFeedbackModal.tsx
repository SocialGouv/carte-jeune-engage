import {
  Flex,
  Text,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Button,
} from "@chakra-ui/react";

type CouponUsedFeedbackModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

const CouponUsedFeedbackModal = (props: CouponUsedFeedbackModalProps) => {
  const { isOpen, onClose, onConfirm } = props;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent borderRadius="2.5xl" bgColor="white" mx={4} my="auto">
        <ModalBody>
          <Flex flexDir="column" textAlign="center" px={2} py={4} gap={2}>
            <Text
              fontSize={24}
              color="blackLight"
              fontWeight={800}
              mt={5}
              mx={8}
            >
              Tout s'est bien passé quand vous avez utilisé le code ?
            </Text>
            <Button
              fontWeight={800}
              fontSize={"sm"}
              mx={16}
              colorScheme="primaryShades"
              mt={6}
              onClick={() => {
                onConfirm();
                onClose();
              }}
            >
              Oui! Parfait
            </Button>
            <Button
              colorScheme="errorShades"
              fontSize={"sm"}
              mx={16}
              fontWeight={800}
              onClick={() => {
                onConfirm();
                onClose();
              }}
            >
              Non vraiment pas...
            </Button>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default CouponUsedFeedbackModal;
