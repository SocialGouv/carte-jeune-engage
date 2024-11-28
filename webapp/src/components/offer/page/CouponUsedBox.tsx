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

  const { mutateAsync: mutateCouponUsed } = api.coupon.usedFromUser.useMutation(
    {
      onSuccess: () =>
        utils.coupon.getOne.invalidate({ offer_id: coupon.offer.id }),
    }
  );

  const handleCouponUsed = (used: boolean) => {
    console.log(used);
    if (!used) {
      setShowUsedBox(false);
    } else {
      onOpenCouponUsedFeedbackModal();
    }
  };

  const closeFeedbackModal = () => {
    onCloseCouponUsedFeedbackModal();
    setIsSwitched(true);

    setTimeout(() => {
      confirmCouponUsed();
    }, 1000);

    // window.open(
    // 	"https://surveys.hotjar.com/8d25a606-6e24-4437-97be-75fcdb4c3e35",
    // 	"_blank"
    // );
  };

  if (!showUsedBox) return;

  return (
    <Flex
      direction={"column"}
      gap={4}
      p={3}
      bg="white"
      rounded={"2xl"}
      borderWidth={2}
      borderColor="cje-gray.400"
      mt={6}
    >
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
        onClose={closeFeedbackModal}
        onConfirm={() => mutateCouponUsed({ coupon_id: coupon.id })}
      />
    </Flex>
  );
};

export default CouponUsedBox;
