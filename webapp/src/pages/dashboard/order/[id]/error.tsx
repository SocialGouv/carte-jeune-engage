import { Button } from "@chakra-ui/react";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import LayoutOrderStatus from "~/components/obiz/LayoutOrderStatus";

type OrderSuccessProps = {
  order_id: string;
};

export const OrderError = ({ order_id }: OrderSuccessProps) => {
  const router = useRouter();

  return (
    <LayoutOrderStatus
      title="Erreur lors de la livraison de la commande"
      subtitle="Quelque chose n'a pas fonctionné"
      status="error"
      onClose={() => router.push(`/dashboard/order/${order_id}`)}
    >
      <Button
        mt="auto"
        colorScheme="blackBtn"
        onClick={() => router.push(`/dashboard/order/${order_id}`)}
      >
        Retourner à la commande
      </Button>
    </LayoutOrderStatus>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const order_id = query.id;
  return {
    props: { order_id },
  };
};

export default OrderError;
