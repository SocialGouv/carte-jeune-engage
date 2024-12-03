import {
  Flex,
  Text,
  Button,
  useDisclosure,
  FormControl,
  FormLabel,
  Switch,
} from "@chakra-ui/react";
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
  const utils = api.useUtils();

  const [showUsedBox, setShowUsedBox] = useState<boolean>(true);
  const [isSwitched, setIsSwitched] = useState<boolean>(false);

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

  const confirmUsed = () => {
    mutateCouponUsed({ coupon_id: coupon.id });

    setTimeout(() => {
      setIsSwitched(true);
    }, 500);

    setTimeout(() => {
      confirmCouponUsed();
    }, 1000);
  };

  if (!showUsedBox) return;

  return (
    <Flex direction={"column"} gap={4} p={4} bg="white" rounded={"2xl"} mt={6}>
      <FormControl
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        onClick={() => handleCouponUsed(true)}
      >
        <FormLabel htmlFor="coupon-used" mb={0}>
          J'ai déjà utilisé la réduction
        </FormLabel>
        <Switch id="coupon-used" isChecked={isSwitched} />
      </FormControl>
      <CouponUsedFeedbackModal
        isOpen={isOpenCouponUsedFeedbackModal}
        onClose={onCloseCouponUsedFeedbackModal}
        onConfirm={confirmUsed}
      />
    </Flex>
  );
};

export default CouponUsedBox;
