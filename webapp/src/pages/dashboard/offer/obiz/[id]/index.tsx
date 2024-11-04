import { Box } from "@chakra-ui/react";
import { useRouter } from "next/router";
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

  return <Box>{JSON.stringify(resultOffer, null, 2)}</Box>;
}
