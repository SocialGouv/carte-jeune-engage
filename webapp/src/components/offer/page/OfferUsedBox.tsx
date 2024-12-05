import {
  Flex,
  useDisclosure,
  FormControl,
  FormLabel,
  Switch,
} from "@chakra-ui/react";
import { useState } from "react";
import UsedFeedbackModal from "~/components/modals/UsedFeedbackModal";
import { CouponIncluded } from "~/server/api/routers/coupon";
import { OrderIncluded } from "~/server/api/routers/order";
import { api } from "~/utils/api";

type OfferUsedBoxDefaultProps = {
  onConfirm: () => void;
};

interface CouponUsedBoxProps extends OfferUsedBoxDefaultProps {
  kind: "coupon";
  coupon: CouponIncluded;
}

interface OrderUsedBoxProps extends OfferUsedBoxDefaultProps {
  kind: "order";
  order: OrderIncluded;
}

type OfferUsedBoxProps = CouponUsedBoxProps | OrderUsedBoxProps;

const OfferUsedBox = (props: OfferUsedBoxProps) => {
  const { kind, onConfirm } = props;

  const [showUsedBox, setShowUsedBox] = useState<boolean>(true);
  const [isSwitched, setIsSwitched] = useState<boolean>(false);

  const {
    isOpen: isOpenCouponUsedFeedbackModal,
    onOpen: onOpenCouponUsedFeedbackModal,
    onClose: onCloseCouponUsedFeedbackModal,
  } = useDisclosure();

  const { mutate: mutateCouponUsed } = api.coupon.usedFromUser.useMutation();

  const { mutate: mutateOrderUsed } = api.order.usedFromUser.useMutation();

  const handleCouponUsed = (used: boolean) => {
    if (!used) {
      setShowUsedBox(false);
    } else {
      onOpenCouponUsedFeedbackModal();
    }
  };

  const confirmUsed = () => {
    if (kind === "coupon") {
      const { coupon } = props;
      mutateCouponUsed({ coupon_id: coupon.id });
    } else {
      const { order } = props;
      mutateOrderUsed({ order_id: order.id });
    }

    setTimeout(() => {
      setIsSwitched(true);
    }, 500);

    setTimeout(() => {
      onConfirm();
    }, 1000);
  };

  if (!showUsedBox) return;

  return (
    <Flex direction="column" gap={4} p={4} bg="white" rounded="2xl">
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
      <UsedFeedbackModal
        isOpen={isOpenCouponUsedFeedbackModal}
        onClose={onCloseCouponUsedFeedbackModal}
        onConfirm={confirmUsed}
        offer_id={
          kind === "coupon" ? props.coupon.offer.id : props.order.offer.id
        }
        kind={kind}
      />
    </Flex>
  );
};

export default OfferUsedBox;
