import { Box, Center } from "@chakra-ui/react";
import { useRouter } from "next/router";
import LoadingLoader from "~/components/LoadingLoader";
import { api } from "~/utils/api";

export default function OfferObizPage() {
  const router = useRouter();

  const { id } = router.query as {
    id: string;
  };

  const { data: resultOffer, isLoading: isLoadingOffer } =
    api.offer.getById.useQuery(
      { id: parseInt(id), source: "obiz" },
      { enabled: id !== undefined }
    );

  const { data: offer } = resultOffer || {};

  if (isLoadingOffer || !router.isReady) {
    return (
      <Center h="full">
        <LoadingLoader />
      </Center>
    );
  }

  if (!offer) {
    router.replace("/dashboard");
    return;
  }

  return <Box>{JSON.stringify(resultOffer, null, 2)}</Box>;
}
