import { Center } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import LoadingLoader from "~/components/LoadingLoader";
import OfferCard from "~/components/cards/OfferCard";
import CategoryWrapper from "~/components/wrappers/CategoryWrapper";
import { TagIncluded } from "~/server/api/routers/tag";
import { api } from "~/utils/api";

export default function CategoryOfferList() {
  const router = useRouter();
  const { slug } = router.query;

  const [isFirstLoading, setIsFirstLoading] = useState(true);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [tagsFromOffers, setTagsFromOffers] = useState<TagIncluded[]>();

  const { data: resultTag } = api.tag.getBySlug.useQuery(
    {
      slug: slug as string,
    },
    { enabled: slug !== undefined }
  );

  const { data: tag } = resultTag || {};

  const { data: resultOffers, isLoading: isLoadingOffers } =
    api.offer.getListOfAvailables.useQuery(
      {
        page: 1,
        perPage: 50,
        sort: "partner.name",
        tagIds: [tag?.id as number, ...selectedTagIds],
      },
      { enabled: tag?.id !== undefined }
    );

  const { data: offers } = resultOffers || {};

  const handleOnSelectTag = (tagId: number) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((item) => item !== tagId)
        : [...prev, tagId]
    );
  };

  useEffect(() => {
    if (tag) setSelectedTagIds([tag.id]);
  }, [tag]);

  useEffect(() => {
    if (isFirstLoading && offers && offers.length > 0) {
      setTagsFromOffers([
        ...new Set(
          offers.flatMap((offer) =>
            offer.tags.flatMap((tag) => tag)
          ) as TagIncluded[]
        ),
      ]);
      setIsFirstLoading(false);
    }
  }, [offers]);

  if (!tag) return;

  if (isLoadingOffers || !offers || !tagsFromOffers)
    return (
      <CategoryWrapper>
        <Center w="full" h="full">
          <LoadingLoader />
        </Center>
      </CategoryWrapper>
    );

  return (
    <CategoryWrapper
      tags={tagsFromOffers}
      selectedTagIds={selectedTagIds}
      onSelectTag={handleOnSelectTag}
    >
      {offers.map((offer) => (
        <OfferCard
          key={offer.id}
          offer={offer}
          matomoEvent={[
            "Explorer",
            `Étiquette - ${tag.label} - Offre - ${offer.partner.name} - ${offer.title}`,
          ]}
        />
      ))}
    </CategoryWrapper>
  );
}
