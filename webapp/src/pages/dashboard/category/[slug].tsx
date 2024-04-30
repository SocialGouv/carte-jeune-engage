import { Center } from "@chakra-ui/react";
import { useRouter } from "next/router";
import LoadingLoader from "~/components/LoadingLoader";
import OfferCard from "~/components/cards/OfferCard";
import CategoryWrapper from "~/components/wrappers/CategoryWrapper";
import { api } from "~/utils/api";

export default function CategoryOfferList() {
  const router = useRouter();
  const { slug } = router.query;

  const { data: resultCategory } = api.category.getBySlug.useQuery(
    {
      slug: slug as string,
    },
    { enabled: slug !== undefined }
  );

  const { data: category } = resultCategory || {};

  const { data: resultOffers, isLoading: isLoadingOffers } =
    api.offer.getListOfAvailables.useQuery(
      {
        page: 1,
        perPage: 50,
        sort: "partner.name",
        categoryId: category?.id,
      },
      { enabled: category?.id !== undefined }
    );

  const { data: offers } = resultOffers || {};

  if (!category) return;

  if (isLoadingOffers || !offers)
    return (
      <CategoryWrapper category={category}>
        <Center w="full" h="full">
          <LoadingLoader />
        </Center>
      </CategoryWrapper>
    );

  return (
    <CategoryWrapper category={category}>
      {offers?.map((offer) => (
        <OfferCard
          key={offer.id}
          offer={offer}
          matomoEvent={[
            "Explorer",
            `Catégories - ${category.label} - Offre - ${offer.partner.name} - ${offer.title}`,
          ]}
        />
      ))}
    </CategoryWrapper>
  );
}
