import { Button } from "@chakra-ui/react";
import { useRouter } from "next/router";
import LayoutOrderStatus from "~/components/obiz/LayoutOrderStatus";

export const OrderError = () => {
  const router = useRouter();

  return (
    <LayoutOrderStatus
      title="Erreur lors de la livraison de la commande"
      subtitle="Quelque chose n'a pas fonctionné"
      status="error"
      onClose={() => router.push(`/dashboard`)}
    >
      <Button
        mt="auto"
        colorScheme="blackBtn"
        onClick={() => router.push(`/dashboard`)}
      >
        Retourner à la page d'accueil
      </Button>
    </LayoutOrderStatus>
  );
};

export default OrderError;
