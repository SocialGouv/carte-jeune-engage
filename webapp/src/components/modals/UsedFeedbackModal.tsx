import {
  Flex,
  Text,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Button,
  ButtonGroup,
  ModalCloseButton,
  Box,
} from "@chakra-ui/react";
import { useState } from "react";
import { api } from "~/utils/api";
import { FormBlock } from "../forms/payload/Form";
import { Form } from "~/payload/payload-types";
import { useAuth } from "~/providers/Auth";
import { UserIncluded } from "~/server/api/routers/user";
import { CouponIncluded } from "~/server/api/routers/coupon";

type CouponUsedFeedbackModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  kind: "coupon" | "order";
  offer_id: number;
};

const CouponUsedFeedbackModalContent = ({
  couponUsedFeedbackForm,
  currentStep,
  setCurrentStep,
  onClose,
  user,
  offer_id,
}: {
  couponUsedFeedbackForm: Form | undefined;
  currentStep: "form" | "finish" | undefined;
  setCurrentStep: (step: "form" | "finish" | undefined) => void;
  user: UserIncluded | null;
  onClose: () => void;
  offer_id: number;
}) => {
  switch (currentStep) {
    case "form":
      return (
        <Box mt={8} px={2}>
          {couponUsedFeedbackForm && (
            <FormBlock
              form={couponUsedFeedbackForm as any}
              afterOnSubmit={() => setCurrentStep("finish")}
              enableIntro={true}
              offer_id={offer_id}
            />
          )}
        </Box>
      );
    case "finish":
      return (
        <Flex mt={10} px={2} flexDir="column" alignItems="center" gap={6}>
          <Text fontSize={24} textAlign="center" fontWeight={800}>
            Merci pour votre avis
            <br />
            {user?.firstName ?? ""} !
            <br />
            🤝
          </Text>
          <Button
            w="fit-content"
            size="md"
            px={8}
            colorScheme="blackBtn"
            onClick={onClose}
          >
            Ok
          </Button>
        </Flex>
      );
    default:
      return (
        <Flex flexDir="column" textAlign="center" px={2} py={4} gap={2}>
          <Text fontSize={24} color="blackLight" fontWeight={800} mt={5} mx={8}>
            Vous avez utilisé ce code ?
          </Text>
          <Text fontWeight={500} lineHeight="normal">
            Ce code là n’est valable qu’1 fois
            <br />
            <br />
            Vous ne pourrez plus le réutiliser ensuite
            <br />
            <br />
            Vous pouvez obtenir un nouveau code dans 24h
            <br />
            <br />
            Confirmer que vous avez utilisé ce code ?
          </Text>
          <ButtonGroup justifyContent="center" mt={6} gap={4}>
            <Button
              colorScheme="blackBtn"
              fontSize="sm"
              p={7}
              fontWeight={800}
              onClick={onClose}
            >
              Non
            </Button>
            <Button
              fontWeight={800}
              fontSize="sm"
              p={7}
              colorScheme="blackBtn"
              onClick={() => {
                setCurrentStep(couponUsedFeedbackForm ? "form" : "finish");
              }}
            >
              Oui
            </Button>
          </ButtonGroup>
        </Flex>
      );
  }
};

const UsedFeedbackModal = (props: CouponUsedFeedbackModalProps) => {
  const { isOpen, onClose, onConfirm, offer_id, kind } = props;
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState<"form" | "finish" | undefined>(
    undefined
  );

  const { data: resultForm } = api.form.getFormBySlug.useQuery({
    slug: `${kind}-used-feedback-form`,
  });

  const { data: form } = resultForm || {};

  const closeModal = () => {
    setCurrentStep(undefined);
    if (currentStep) onConfirm();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      closeOnOverlayClick={false}
      isCentered
    >
      <ModalOverlay />
      <ModalContent borderRadius="2.5xl" bgColor="white" mx={4}>
        <ModalCloseButton onClick={closeModal} />
        <ModalBody pb={8}>
          <CouponUsedFeedbackModalContent
            user={user}
            couponUsedFeedbackForm={form}
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
            onClose={closeModal}
            offer_id={offer_id}
          />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default UsedFeedbackModal;
