import { Center, Flex } from "@chakra-ui/react";
import { useRouter } from "next/router";
import LoadingLoader from "~/components/LoadingLoader";
import { api } from "~/utils/api";

export default function OrderObizPage() {
  const router = useRouter();

  const { id } = router.query as {
    id: string;
  };

  const { data: resultOrder, isLoading: isLoadingOrder } =
    api.order.getById.useQuery(
      { id: parseInt(id) },
      { enabled: id !== undefined }
    );

  const { data: order } = resultOrder || {};

  if (isLoadingOrder || !router.isReady) {
    return (
      <Center h="full">
        <LoadingLoader />
      </Center>
    );
  }

  if (!order) {
    router.replace("/dashboard");
    return;
  }

  return (
    <Flex direction={"column"} position="relative">
      {JSON.stringify(order, null, 2)}
    </Flex>
  );
}
