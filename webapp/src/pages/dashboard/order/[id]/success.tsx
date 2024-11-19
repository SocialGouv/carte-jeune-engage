import { Button, Flex, Heading, Icon, Slide, Text } from "@chakra-ui/react";
import _ from "lodash";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { HiMiniClock, HiMiniEnvelope } from "react-icons/hi2";
import LayoutOrderStatus, {
  LayoutOrderStatusProps,
} from "~/components/obiz/LayoutOrderStatus";
import Image from "~/components/ui/Image";
import { useAuth } from "~/providers/Auth";
import { api } from "~/utils/api";

type OrderSuccessProps = {
  order_id: string;
};

type Step = {
  status: LayoutOrderStatusProps["status"];
  subtitle: string;
};

export const OrderSuccess = ({ order_id }: OrderSuccessProps) => {
  const utils = api.useUtils();
  const { user } = useAuth();
  const router = useRouter();

  const [stepInterval, setStepInterval] = useState<NodeJS.Timeout>();
  const [currentStep, setCurrentStep] = useState<Step>({
    subtitle: "Validation du paiement...",
    status: "loading",
  });

  const { mutate } = api.order.synchronizeOrder.useMutation({
    onError: (error) => {
      switch (error.data?.code) {
        case "FORBIDDEN":
        case "INTERNAL_SERVER_ERROR":
          router.push(`/dashboard/order/error`);
          break;
      }
    },
  });

  useEffect(() => {
    mutate({ order_id: parseInt(order_id) });

    const steps: Partial<Step>[] = [
      {
        subtitle: "Création des bons d'achat...",
      },
      {
        status: "success",
      },
    ];

    let currentStepIndex = 0;
    let interval = setInterval(() => {
      const step = steps[currentStepIndex];
      setCurrentStep((prev) => ({ ...prev, ...step }));
      if (currentStepIndex < steps.length - 1) {
        currentStepIndex++;
      } else {
        clearInterval(interval);
      }
    }, 2000);

    setStepInterval(interval);

    return () => clearInterval(interval);
  }, []);

  if (!user) return;

  if (currentStep.status === "success") {
    return (
      <Slide
        direction="bottom"
        in={currentStep.status === "success"}
        style={{ zIndex: 10, height: "100%" }}
      >
        <Flex
          flexDir="column"
          h="full"
          bgColor="primary"
          color="white"
          px={8}
          pb={20}
        >
          <Heading
            size="lg"
            fontWeight={800}
            mt="auto"
            lineHeight="normal"
            mb={8}
            textAlign="center"
          >
            Vos bons d'achat arrivent toujours ici
          </Heading>
          <Image
            width={326}
            height={265}
            src="/images/dashboard/portefeuille-obiz-mvp.gif"
            alt="Portefeuille Obiz"
          />
          <Flex mt={8}>
            <Icon as={HiMiniClock} w={5} h={5} mr={4} mt={0.5} />
            <Text fontWeight={500} lineHeight="normal">
              Les bons mettent quelques minutes à arriver et parfois jusqu’à 24h
            </Text>
          </Flex>
          <Flex mt={6}>
            <Icon as={HiMiniEnvelope} w={5} h={5} mr={4} mt={0.5} />
            <Text fontWeight={500} lineHeight="normal">
              On vous envoie un mail dès que vos bons d’achat sont prêts
            </Text>
          </Flex>
          <Button
            mt={6}
            colorScheme="whiteBtn"
            color="black"
            fontWeight={800}
            fontSize={14}
            onClick={() => router.push("/dashboard/wallet")}
          >
            Voir mon portefeuille
          </Button>
        </Flex>
      </Slide>
    );
  }

  return (
    <LayoutOrderStatus
      title={`Nous générons vos bons d'achat ${_.capitalize(user?.firstName ?? "")}`}
      {...currentStep}
    />
  );
};

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const order_id = query.id;
  return {
    props: { order_id },
  };
};

export default OrderSuccess;
