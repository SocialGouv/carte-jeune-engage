import { Box, Button, Flex } from "@chakra-ui/react";
import { Dispatch, SetStateAction, useState } from "react";
import DiscountAmountBlock from "~/components/obiz/DiscountAmountBlock";
import RecapOrder from "~/components/obiz/RecapOrder";
import BackButton from "~/components/ui/BackButton";
import { OfferIncluded } from "~/server/api/routers/offer";
import { api } from "~/utils/api";

const ObizOfferVariableContent = ({
  step,
  setStep,
  amount,
  setAmount,
  offer,
  createOrder,
}: {
  step: "amount" | "summary";
  setStep: Dispatch<SetStateAction<"amount" | "summary">>;
  amount: number;
  setAmount: Dispatch<SetStateAction<number>>;
  offer: OfferIncluded | undefined;
  createOrder: any;
}) => {
  switch (step) {
    case "amount":
      return (
        <>
          <Box mt={8}>
            <DiscountAmountBlock
              discount={5}
              amount={amount}
              setAmount={setAmount}
              minAmount={5}
              maxAmount={100}
            />
          </Box>
          <Button mt={10} onClick={() => setStep("summary")}>
            Acheter mon bon
          </Button>
        </>
      );
    case "summary":
      if (!offer) return null;
      return (
        <>
          <Box mt={8}>
            <RecapOrder discount={5} amount={amount} offer={offer} />
          </Box>
          <Button mt={10} onClick={() => createOrder()}>
            Passer au paiement
          </Button>
        </>
      );
  }
};

export default function ObizOfferVariable() {
  const [amount, setAmount] = useState(0);
  const [step, setStep] = useState<"amount" | "summary">("amount");

  const { mutate: createTestOrder } = api.order.createOrder.useMutation();

  const { data: offerResult } = api.offer.getById.useQuery({
    id: 1,
  });
  const { data: offer } = offerResult || {};

  return (
    <Flex flexDir="column" mt={10} px={8}>
      <BackButton onClick={() => setStep("amount")} />
      <ObizOfferVariableContent
        step={step}
        setStep={setStep}
        amount={amount}
        setAmount={setAmount}
        offer={offer}
        createOrder={createTestOrder}
      />
    </Flex>
  );
}
