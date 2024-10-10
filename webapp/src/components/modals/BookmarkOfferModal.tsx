import {
  Button,
  Flex,
  Icon,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Text,
} from "@chakra-ui/react";
import { HiCheckCircle, HiOutlineBookmark } from "react-icons/hi2";

type BookmarkOfferModalProps = {
  isOpen: boolean;
  onClose: () => void;
  isModalOfferBookmarkSuccess: boolean;
  handleBookmarkOffer: () => void;
};

const BookmarkOfferModal = (props: BookmarkOfferModalProps) => {
  const { isOpen, onClose, isModalOfferBookmarkSuccess, handleBookmarkOffer } =
    props;

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
          <Flex flexDir="column" textAlign="center" px={6} py={4}>
            {!isModalOfferBookmarkSuccess ? (
              <Text fontSize={24} color="blackLight" fontWeight={800}>
                Retrouvez cette offre plus tard ?
              </Text>
            ) : (
              <Icon
                as={HiCheckCircle}
                w={12}
                h={12}
                mx="auto"
                color="success"
              />
            )}
            <Button
              fontWeight={800}
              colorScheme={isModalOfferBookmarkSuccess ? "blue" : "blackBtn"}
              mt={isModalOfferBookmarkSuccess ? 4 : 8}
              onClick={handleBookmarkOffer}
              leftIcon={<Icon as={HiOutlineBookmark} w={6} h={6} />}
            >
              {isModalOfferBookmarkSuccess ? "Enregistré" : "Enregistrer"}
            </Button>
            {!isModalOfferBookmarkSuccess && (
              <Button
                variant="ghost"
                color="disabled"
                fontSize={14}
                fontWeight={800}
                onClick={onClose}
                mt={2}
              >
                Non pas pour le moment
              </Button>
            )}
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default BookmarkOfferModal;
