import { Flex, Text, Button, useDisclosure } from "@chakra-ui/react";
import { useState } from "react";
import CouponUsedFeedbackModal from "~/components/modals/CouponUsedFeedbackModal";
import { CouponIncluded } from "~/server/api/routers/coupon";
import { api } from "~/utils/api";

type CouponUsedBoxProps = {
  coupon: CouponIncluded;
  confirmCouponUsed: () => void;
};

const CouponUsedBox = (props: CouponUsedBoxProps) => {
  const { coupon, confirmCouponUsed } = props;

  const [showUsedBox, setShowUsedBox] = useState<boolean>(true);

  const {
    isOpen: isOpenCouponUsedFeedbackModal,
    onOpen: onOpenCouponUsedFeedbackModal,
    onClose: onCloseCouponUsedFeedbackModal,
  } = useDisclosure();

  const { mutateAsync: mutateCouponUsed } =
    api.coupon.usedFromUser.useMutation();

  const handleCouponUsed = (used: boolean) => {
    if (!used) {
      setShowUsedBox(false);
    } else {
      onOpenCouponUsedFeedbackModal();
    }
  };

  const closeFeedbackModal = () => {
    confirmCouponUsed();
    onCloseCouponUsedFeedbackModal();
  };

  if (!showUsedBox) return;

  return (
    <Flex
      direction={"column"}
      gap={4}
      p={3}
      bg="white"
      borderRadius="2.5xl"
      borderWidth={2}
      borderColor="cje-gray.400"
      mt={6}
    >
      <Text w="full" textAlign={"center"}>
        🤔 Vous avez déjà utilisé votre code ?
      </Text>
      <Flex gap={2}>
        <Button
          fontSize="md"
          rounded={"1.25rem"}
          p={3}
          colorScheme="errorShades"
          flexGrow={1}
          onClick={() => handleCouponUsed(false)}
        >
          Non
        </Button>
        <Button
          fontSize="md"
          rounded={"1.25rem"}
          p={3}
          colorScheme="primaryShades"
          flexGrow={1}
          onClick={() => handleCouponUsed(true)}
        >
          Oui
        </Button>
      </Flex>
      <CouponUsedFeedbackModal
        isOpen={isOpenCouponUsedFeedbackModal}
        onClose={closeFeedbackModal}
        onConfirm={() => mutateCouponUsed({ coupon_id: coupon.id })}
      />
    </Flex>
  );
};

export default CouponUsedBox;
