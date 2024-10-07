import { Flex, Text, Button, useDisclosure } from "@chakra-ui/react";
import { useState } from "react";
import ConfirmModal from "~/components/modals/ConfirmModal";
import { CouponIncluded } from "~/server/api/routers/coupon";
import { api } from "~/utils/api";

type CouponUsedBoxProps = {
  coupon: CouponIncluded;
};

const CouponUsedBox = (props: CouponUsedBoxProps) => {
  const { coupon } = props;

  const [showUsedBox, setShowUsedBox] = useState<boolean>(true);

  const {
    isOpen: isOpenCouponUsedModal,
    onOpen: onOpenCouponUsedModal,
    onClose: onCloseCouponUsedModal,
  } = useDisclosure();

  const { mutateAsync: confirmCouponUsed } =
    api.coupon.usedFromUser.useMutation({
      onSuccess: () => {
        setShowUsedBox(false);
      },
    });

  const handleCouponUsed = (used: boolean) => {
    if (!used) {
      setShowUsedBox(false);
    } else {
      onOpenCouponUsedModal();
    }
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
          colorScheme="dangerShades"
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
      <ConfirmModal
        title={"Confirmer que vous avez utilisé ce code ?"}
        description="Vous ne pourrez plus l'utiliser ensuite"
        labels={{
          primary: "Oui je l'ai utilisé",
          secondary: "Non pas encore",
        }}
        isOpen={isOpenCouponUsedModal}
        onClose={onCloseCouponUsedModal}
        onConfirm={() => {
          confirmCouponUsed({ coupon_id: coupon.id });
        }}
        placement="center"
      />
    </Flex>
  );
};

export default CouponUsedBox;
