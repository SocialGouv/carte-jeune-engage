import { Box, Button, Center, Flex, Heading } from "@chakra-ui/react";
import { Dispatch, SetStateAction, useState } from "react";
import LoadingLoader from "~/components/LoadingLoader";
import DiscountAmountBlock from "~/components/obiz/DiscountAmountBlock";
import RecapOrder from "~/components/obiz/RecapOrder";
import BackButton from "~/components/ui/BackButton";
import { OfferIncluded } from "~/server/api/routers/offer";
import { OfferArticle } from "~/server/types";
import { api } from "~/utils/api";

const ObizOfferVariableContent = ({
  step,
  setStep,
  amount,
  setAmount,
  offer,
  article,
  createOrder,
}: {
  step: "amount" | "summary";
  setStep: Dispatch<SetStateAction<"amount" | "summary">>;
  amount: number;
  setAmount: Dispatch<SetStateAction<number>>;
  article: OfferArticle;
  offer: OfferIncluded;
  createOrder: () => void;
}) => {
  switch (step) {
    case "amount":
      return (
        <>
          <Box mt={8}>
            <DiscountAmountBlock
              discount={article.reductionPercentage}
              amount={amount}
              setAmount={setAmount}
              minAmount={article.minimumPrice || 0}
              maxAmount={article.maximumPrice || 1000}
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
            <RecapOrder
              discount={article.reductionPercentage}
              amount={amount}
              offer={offer}
            />
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

  const { mutate: createTestOrder, isLoading: isCreateOrderLoading } =
    api.order.createOrder.useMutation();

  const { data: offerResult } = api.offer.getById.useQuery({
    id: 6,
  });
  const { data: offer } = offerResult || {};

  if (!offer || !offer.articles) return;

  const availableArticles = offer.articles.filter((a) => !!a.available);
  const article = availableArticles.find((a) => a.kind === "variable_price");

  if (!article) return;

  if (isCreateOrderLoading) {
    return (
      <Center
        h="full"
        w="full"
        flexDirection={"column"}
        justifyContent={"center"}
      >
        <LoadingLoader />
        <Heading textAlign={"center"} mt={6} size="md" fontWeight={900}>
          Votre commande est en cours de traitement...
        </Heading>
      </Center>
    );
  }

  return (
    <Flex flexDir="column" mt={10} px={8}>
      <BackButton onClick={() => setStep("amount")} />
      <ObizOfferVariableContent
        step={step}
        setStep={setStep}
        amount={amount}
        setAmount={setAmount}
        offer={offer}
        article={article}
        createOrder={() => {
          createTestOrder({
            offer_id: offer.id,
            article_reference: article.reference,
            input_value: amount,
          });
        }}
      />
    </Flex>
  );
}
