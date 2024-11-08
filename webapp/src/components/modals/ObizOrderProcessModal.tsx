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
import { formatter2Digits } from "~/utils/tools";
import { useRouter } from "next/router";

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
  selectedArticles: { article: OfferArticle; quantity: number }[];
  setSelectedArticles: Dispatch<
    SetStateAction<{ article: OfferArticle; quantity: number }[]>
  >;
  offer: OfferIncluded;
  createOrder: () => void;
}) => {
  const isVariablePrice =
    articles.length === 1 && articles[0].kind === "variable_price";

  switch (step) {
    case "amount":
      if (isVariablePrice) {
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

        const filteredArticles = articles
          .filter((a) => a.kind === "fixed_price")
          .sort((a, b) => {
            if (a.publicPrice && b.publicPrice)
              return a.publicPrice - b.publicPrice;
            return 0;
          });

        return (
          <>
            <Box mt={10} mb={16}>
              <DiscountAmountBlock
                kind="fixed_price"
                amount={amount}
                setAmount={setAmount}
                articles={filteredArticles}
                selectedArticles={selectedArticles}
                setSelectedArticles={setSelectedArticles}
              />
            </Box>
            <Button
              mt="auto"
              mb={12}
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
            {isVariablePrice ? (
              <RecapOrder
                kind="variable_price"
                discount={articles[0].reductionPercentage}
                amount={amount}
                offer={offer}
              />
            ) : (
              <RecapOrder
                kind="fixed_price"
                discount={articles[0].reductionPercentage}
                articles={selectedArticles}
                amount={amount}
                offer={offer}
              />
            )}
          </Box>
          <Button mt={10} onClick={() => createOrder()} w="full">
            Passer au paiement
          </Button>
        </>
      );
    case "payment":
      const discount = articles[0].reductionPercentage;
      return (
        <LayoutOrderStatus
          status="loading"
          title={`Vous allez payer ${formatter2Digits.format(amount - (amount * discount) / 100)}€`}
        >
          {" "}
          <Box mt="auto" textAlign="center">
            <Icon as={HiMiniShieldCheck} color="primary" boxSize={6} />
            <Text fontSize={12} fontWeight={700} mt={4}>
              Tous les paiements et tous vos bons sont entièrement sécurisés
            </Text>
            <Text fontSize={12} fontWeight={700} mt={4}>
              L’application carte “jeune engagé” est un dispositif de l’État.
            </Text>
          </Box>
        </LayoutOrderStatus>
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
  const router = useRouter();

  const [amount, setAmount] = useState(0);
  const [step, setStep] = useState<Steps>("amount");
  const [selectedArticles, setSelectedArticles] = useState<
    { article: OfferArticle; quantity: number }[]
  >([]);

  const { mutate: createTestOrder } = api.order.createOrder.useMutation({
    onMutate: () => setStep("payment"),
    onSuccess: ({ data: { payment_url } }) => {
      if (payment_url) window.location.href = payment_url;
    },
    onError: () => router.push("/dashboard/order/error"),
  });

  const { data: offerResult } = api.offer.getById.useQuery({
    id: offerId,
  });
  const { data: offer } = offerResult || {};

  if (!offer || !offer.articles) return;

  const availableArticles = offer.articles.filter((a) => !!a.available);

  if (availableArticles.length === 0) return;

  const discount = availableArticles[0].reductionPercentage;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full">
      <ModalOverlay />
      <ModalContent minH="full">
        <ModalBody display="flex" flexDir="column" px={8} minH="full">
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
              if (
                availableArticles.length === 1 &&
                availableArticles[0].kind === "variable_price"
              ) {
                createTestOrder({
                  offer_id: offer.id,
                  article_references: [
                    { reference: availableArticles[0].reference, quantity: 1 },
                  ],
                  input_value: parseFloat(
                    formatter2Digits.format(amount - (amount * discount) / 100)
                  ),
                });
              } else {
                createTestOrder({
                  offer_id: offer.id,
                  article_references: selectedArticles.map((article) => ({
                    reference: article.article.reference,
                    quantity: article.quantity,
                  })),
                });
              }
            }}
            selectedArticles={selectedArticles}
            setSelectedArticles={setSelectedArticles}
          />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
