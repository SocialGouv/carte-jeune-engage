import _ from "lodash";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import LayoutOrderStatus, {
  LayoutOrderStatusProps,
} from "~/components/obiz/LayoutOrderStatus";
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
    onSuccess: ({ data }) => {
      if (data.ticket) {
        clearInterval(stepInterval);
        utils.order.getById.invalidate({ id: parseInt(order_id) });
        setCurrentStep({
          status: "success",
          subtitle: "Tout est bon",
        });
        setTimeout(() => router.push(`/dashboard/order/${order_id}`), 1000);
      }
    },
    onError: (error) => {
      switch (error.data?.code) {
        case "FORBIDDEN":
        case "INTERNAL_SERVER_ERROR":
          router.push(`/dashboard/order/${order_id}/error`);
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
    ];

    let currentStepIndex = 0;
    let interval = setInterval(() => {
      const step = steps[currentStepIndex];
      setCurrentStep((prev) => ({ ...prev, ...step }));
      if (currentStepIndex < steps.length - 1) {
        currentStepIndex++;
      } else {
        clearInterval(interval);
        router.push(`/dashboard/order/${order_id}`);
      }
    }, 2000);

    setStepInterval(interval);

    return () => clearInterval(interval);
  }, []);

  if (!user) return;

  return (
    <LayoutOrderStatus
      title={
        currentStep.status === "success"
          ? "C'est prêt !"
          : `Nous générons vos bons d'achat ${_.capitalize(user?.firstName ?? "")}`
      }
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
