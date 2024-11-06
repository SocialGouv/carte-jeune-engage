import {
  Box,
  Button,
  Icon,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Text,
} from "@chakra-ui/react";
import { Dispatch, SetStateAction, useState } from "react";
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
  articles,
  createOrder,
  selectedArticles,
  setSelectedArticles,
}: {
  step: Steps;
  setStep: Dispatch<SetStateAction<Steps>>;
  amount: number;
  setAmount: Dispatch<SetStateAction<number>>;
  articles: OfferArticle[];
  selectedArticles?: { reference: string; quantity: number }[];
  setSelectedArticles?: Dispatch<
    SetStateAction<{ reference: string; quantity: number }[]>
  >;
  offer: OfferIncluded;
  createOrder: () => void;
}) => {
  switch (step) {
    case "amount":
      if (articles.length === 1 && articles[0].kind === "variable_price") {
        const article = articles[0];
        const minimumPrice = article.minimumPrice ?? 0;
        const maximumPrice = article.maximumPrice ?? 1000;
        const isDisabled =
          amount === 0 ||
          amount < minimumPrice ||
          amount > maximumPrice ||
          amount % 1 !== 0;

        return (
          <>
            <Box mt={10}>
              <DiscountAmountBlock
                kind="variable_price"
                discount={article.reductionPercentage}
                amount={amount}
                setAmount={setAmount}
                minAmount={minimumPrice}
                maxAmount={maximumPrice}
              />
            </Box>
            <Button
              mt="auto"
              mb={24}
              onClick={() => setStep("summary")}
              w="full"
              isDisabled={isDisabled}
            >
              Acheter mon bon
            </Button>
          </>
        );
      } else {
        if (!selectedArticles || !setSelectedArticles) return null;
        return (
          <>
            <Box mt={10}>
              <DiscountAmountBlock
                kind="fixed_price"
                amount={amount}
                setAmount={setAmount}
                articles={articles}
                selectedArticles={selectedArticles}
                setSelectedArticles={setSelectedArticles}
              />
            </Box>
            <Button
              mt="auto"
              mb={24}
              onClick={() => setStep("summary")}
              isDisabled={amount === 0}
              w="full"
            >
              Acheter ces bons
            </Button>
          </>
        );
      }
    case "summary":
      if (!offer) return null;
      return (
        <>
          <Box mt={10}>
            <RecapOrder
              discount={articles[0].reductionPercentage}
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

type Steps = "amount" | "summary" | "payment";

export default function ObizOrderProcessModal(
  props: ObizOrderProcessModalProps
) {
  const { isOpen, onClose, offerId } = props;

  const [amount, setAmount] = useState(0);
  const [step, setStep] = useState<Steps>("amount");
  const [selectedArticles, setSelectedArticles] = useState<
    { reference: string; quantity: number }[]
  >([]);

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

  if (availableArticles.length === 0) return;

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
            articles={availableArticles}
            createOrder={() => {
              createTestOrder({
                offer_id: offer.id,
                article_reference: availableArticles[0].reference,
                input_value: amount,
              });
            }}
            selectedArticles={selectedArticles}
            setSelectedArticles={setSelectedArticles}
          />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
