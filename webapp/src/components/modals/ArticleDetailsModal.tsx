import {
  Flex,
  Icon,
  Text,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
} from "@chakra-ui/react";
import { HiChevronLeft, HiXMark } from "react-icons/hi2";
import { OfferArticle } from "~/server/types";

type ArticleDetailsModalProps = {
  article: OfferArticle;
  isOpen: boolean;
  onClose: () => void;
};

const ArticleDetailsModal = (props: ArticleDetailsModalProps) => {
  const { article, isOpen, onClose } = props;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full">
      <ModalOverlay />
      <ModalContent bg="bgGray" borderTopRadius={"xl"} mt={"50vh"} pt={14}>
        <ModalCloseButton right={6} top={6}>
          <Icon as={HiXMark} w={6} h={6} />
        </ModalCloseButton>
        <ModalBody pb={12}>
          <Flex>
            <Text
              dangerouslySetInnerHTML={{
                __html: article.description || "Aucune condition.",
              }}
            />
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ArticleDetailsModal;
