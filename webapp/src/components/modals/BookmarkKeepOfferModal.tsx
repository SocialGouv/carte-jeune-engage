import {
  Button,
  Flex,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Text,
} from "@chakra-ui/react";

type BookmarkKeepOfferModalProps = {
  isOpen: boolean;
  onClose: () => void;
  handleRemoveCouponFromUser: () => void;
};

const BookmarkKeepOfferModal = (props: BookmarkKeepOfferModalProps) => {
  const { isOpen, onClose, handleRemoveCouponFromUser } = props;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent
        borderRadius="2.5xl"
        bgColor="white"
        mt="auto"
        mb={8}
        mx={4}
      >
        <ModalBody>
          <Flex flexDir="column" textAlign="center" px={2} py={4}>
            <Text fontSize={24} color="blackLight" fontWeight={800} mt={5}>
              Vous n’en voulez plus ?
            </Text>
            <Button
              fontWeight={800}
              mx={8}
              colorScheme="blackBtn"
              mt={8}
              onClick={onClose}
            >
              Je la garde
            </Button>
            <Button
              variant="ghost"
              color="disabled"
              colorScheme="whiteBtn"
              fontSize={14}
              fontWeight={800}
              onClick={() => {
                handleRemoveCouponFromUser();
                onClose();
              }}
            >
              Je n'en veux plus
            </Button>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default BookmarkKeepOfferModal;
