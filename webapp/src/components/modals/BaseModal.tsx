import {
  Box,
  Icon,
  IconButton,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  ResponsiveValue,
  useBreakpointValue,
} from "@chakra-ui/react";
import { HiMiniXMark } from "react-icons/hi2";

type BaseModalProps = {
  children: React.ReactNode;
  onClose: () => void;
  isOpen: boolean;
  title?: string;
  hideCloseBtn?: boolean;
  size?: ResponsiveValue<string>;
  pb?: ResponsiveValue<number>;
  pt?: ResponsiveValue<number>;
  heightModalContent?: ResponsiveValue<number | string>;
};

const BaseModal = ({
  children,
  onClose,
  isOpen,
  hideCloseBtn,
  title,
  size,
  pb,
  pt,
  heightModalContent,
}: BaseModalProps) => {
  const isMobile = useBreakpointValue({ base: true, lg: false });

  let modalSize: ResponsiveValue<string> = isMobile ? "full" : "desktop";
  if (size) modalSize = size;

  return (
    <Modal size={modalSize} onClose={onClose} isOpen={isOpen}>
      <ModalOverlay bgColor={isMobile ? "bgWhite" : undefined} />
      <ModalContent
        minH={isMobile ? "full" : "auto"}
        boxShadow={isMobile ? "none" : "inherit"}
        h={heightModalContent ? heightModalContent : "auto"}
        bgColor="bgWhite"
        pt={hideCloseBtn ? 6 : 0}
      >
        {!hideCloseBtn && (
          <IconButton
            size="md"
            colorScheme="whiteBtn"
            alignSelf="start"
            m={6}
            borderRadius="lg"
            icon={<Icon as={HiMiniXMark} color="black" w={5} h={5} />}
            onClick={onClose}
            aria-label="Fermer la modal"
          />
        )}
        {title && (
          <ModalHeader fontWeight="extrabold" fontSize="2xl">
            {title}
          </ModalHeader>
        )}
        <ModalBody pt={pt} pb={pb ? pb : 44}>
          {children}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default BaseModal;
