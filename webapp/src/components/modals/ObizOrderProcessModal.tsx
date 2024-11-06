import {
  Box,
  Button,
  Center,
  Flex,
  Heading,
  Icon,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Text,
} from "@chakra-ui/react";
import { Dispatch, SetStateAction, useState } from "react";
import LoadingLoader from "~/components/LoadingLoader";
import DiscountAmountBlock from "~/components/obiz/DiscountAmountBlock";
import RecapOrder from "~/components/obiz/RecapOrder";
import BackButton from "~/components/ui/BackButton";
import { OfferIncluded } from "~/server/api/routers/offer";
import { OfferArticle } from "~/server/types";
import { api } from "~/utils/api";
import LayoutOrderStatus from "../obiz/LayoutOrderStatus";
import { HiMiniShieldCheck } from "react-icons/hi2";

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
          <Box mt={10}>
            <DiscountAmountBlock
              discount={article.reductionPercentage}
              amount={amount}
              setAmount={setAmount}
              minAmount={article.minimumPrice || 0}
              maxAmount={article.maximumPrice || 1000}
            />
          </Box>
          <Button mt="auto" mb={24} onClick={() => setStep("summary")} w="full">
            Acheter mon bon
          </Button>
        </>
      );
    case "summary":
      if (!offer) return null;
      return (
        <>
          <Box mt={10}>
            <RecapOrder
              discount={article.reductionPercentage}
              amount={amount}
              offer={offer}
            />
          </Box>
          <Button mt={10} onClick={() => createOrder()} w="full">
            Passer au paiement
          </Button>
        </>
      );
    case "payment":
      return (
        <LayoutOrderStatus
          status="loading"
          title={`Vous allez payer ${amount}€`}
          footer={
            <Box mt="auto" textAlign="center">
              <Icon as={HiMiniShieldCheck} color="primary" boxSize={6} />
              <Text fontSize={12} fontWeight={700} mt={4}>
                Tous les paiements et tous vos bons sont entièrement sécurisés
              </Text>
              <Text fontSize={12} fontWeight={700} mt={4}>
                L’application carte “jeune engagé” est un dispositif de l’État.
              </Text>
            </Box>
          }
        />
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
    onSuccess: ({ data: { payment_url } }) => {
      if (payment_url) window.location.href = payment_url;
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
      <ModalContent h="100dvh">
        <ModalBody display="flex" flexDir="column" px={8} h="100dvh">
          {step !== "payment" && (
            <Box mt={8}>
              <BackButton
                onClick={() =>
                  step == "amount" ? onClose() : setStep("amount")
                }
              />
            </Box>
          )}
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
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}