import {
  Box,
  Button,
  Center,
  Flex,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
} from "@chakra-ui/react";
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
  step: "amount" | "summary" | "payment";
  setStep: Dispatch<SetStateAction<"amount" | "summary" | "payment">>;
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
          <DiscountAmountBlock
            discount={article.reductionPercentage}
            amount={amount}
            setAmount={setAmount}
            minAmount={article.minimumPrice || 0}
            maxAmount={article.maximumPrice || 1000}
          />
          <Button mt={10} onClick={() => setStep("summary")}>
            Acheter mon bon
          </Button>
        </>
      );
    case "summary":
      if (!offer) return null;
      return (
        <>
          <RecapOrder
            discount={article.reductionPercentage}
            amount={amount}
            offer={offer}
          />
          <Button mt={10} onClick={() => createOrder()}>
            Passer au paiement
          </Button>
        </>
      );
    case "payment":
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
};

type ObizOrderProcessModalProps = {
  isOpen: boolean;
  onClose: () => void;
  offerId: number;
};

export default function ObizOrderProcessModal(
  props: ObizOrderProcessModalProps
) {
  const { isOpen, onClose, offerId } = props;

  const [amount, setAmount] = useState(0);
  const [step, setStep] = useState<"amount" | "summary" | "payment">("amount");

  const { mutate: createTestOrder } = api.order.createOrder.useMutation({
    onMutate: () => setStep("payment"),
    onSuccess: ({ data: paymentLink }) => {
      window.location.href = paymentLink;
    },
  });

  const { data: offerResult } = api.offer.getById.useQuery({
    id: offerId,
  });
  const { data: offer } = offerResult || {};

  if (!offer || !offer.articles) return;

  const availableArticles = offer.articles.filter((a) => !!a.available);
  const article = availableArticles.find((a) => a.kind === "variable_price");

  if (!article) return;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full">
      <ModalOverlay />
      <ModalContent>
        <ModalBody px={8}>
          <Box mt={8}>
            <BackButton
              onClick={() => (step == "amount" ? onClose() : setStep("amount"))}
            />
          </Box>
          <Flex flexDir="column" mt={10}>
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
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
