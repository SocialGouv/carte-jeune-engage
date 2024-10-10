import {
  Button,
  Flex,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Text,
} from "@chakra-ui/react";

type ConfirmModalProps = {
  title: string;
  description?: string;
  labels?: {
    primary?: string;
    secondary?: string;
  };
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  placement?: "bottom" | "center";
  danger?: boolean;
};

const ConfirmModal = (props: ConfirmModalProps) => {
  const {
    title,
    description,
    labels,
    isOpen,
    onClose,
    onConfirm,
    placement = "bottom",
    danger = false,
  } = props;

  let placementProps = {};
  switch (placement) {
    case "bottom":
      placementProps = {
        mt: "auto",
        mb: 8,
      };
      break;
    case "center":
      placementProps = {
        my: "auto",
      };
      break;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent
        borderRadius="2.5xl"
        bgColor="white"
        mx={4}
        {...placementProps}
      >
        <ModalBody>
          <Flex flexDir="column" textAlign="center" px={2} py={4}>
            <Text fontSize={24} color="blackLight" fontWeight={800} mt={5}>
              {title}
            </Text>
            {description && (
              <Text fontSize={"md"} mt={2}>
                {description}
              </Text>
            )}
            <Button
              fontWeight={800}
              mx={8}
              colorScheme={danger ? "errorShades" : "blackBtn"}
              mt={8}
              onClick={() => {
                onConfirm();
                onClose();
              }}
            >
              {labels?.primary || "Oui"}
            </Button>
            <Button
              variant="ghost"
              color="disabled"
              colorScheme="whiteBtn"
              fontSize={14}
              fontWeight={800}
              onClick={onClose}
            >
              {labels?.secondary || "Non"}
            </Button>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ConfirmModal;
