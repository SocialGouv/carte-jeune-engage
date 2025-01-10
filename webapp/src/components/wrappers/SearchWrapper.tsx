import { Box, Center, Flex, Icon, IconButton } from "@chakra-ui/react";
import SearchBar from "../SearchBar";
import { HiChevronLeft } from "react-icons/hi2";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useDebounceValue } from "usehooks-ts";
import { api } from "~/utils/api";
import { paginateArray } from "~/utils/tools";
import { TagIncluded } from "~/server/api/routers/tag";
import { Media, Offer, Partner } from "~/payload/payload-types";
import LoadingLoader from "../LoadingLoader";
import { PartnerIncluded } from "~/server/api/routers/partner";
import BannerEndApp from "../BannerEndApp";

type SearchWrapperProps = {
  onSearchChange?: (search: string) => void;
  fromWidget?: boolean;
  children: (
    paginatedTags: TagIncluded[][],
    partners: (PartnerIncluded & {
      link: string;
      offer: { kind: string; source: Offer["source"] };
    })[],
    debouncedSearch: string
  ) => React.ReactNode;
};

const SearchWrapper = ({
  children,
  onSearchChange,
  fromWidget,
}: SearchWrapperProps) => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounceValue(search, 500);
  const isSearchDebounced = debouncedSearch !== search;

  const { data: resultTags, isLoading: isLoadingTags } =
    api.globals.tagsListOrdered.useQuery({
      search: debouncedSearch,
    });

  const { data: resultOffers, isLoading: isLoadingOffers } = fromWidget
    ? api.offer.getWidgetListOfAvailables.useQuery({
        page: 1,
        perPage: 8,
        searchOnPartner: debouncedSearch,
      })
    : api.offer.getListOfAvailables.useQuery({
        page: 1,
        perPage: 8,
        searchOnPartner: debouncedSearch,
      });

  const { data: tags } = resultTags || { data: [] };
  const { data: offers } = resultOffers || { data: [] };

  const partners = offers.map((offer) => ({
    ...offer.partner,
    offer: { kind: offer.kind, source: offer.source },
    link: fromWidget
      ? `/widget/offer/${offer.id}`
      : `/dashboard/offer/${offer.source}/${offer.id}`,
  }));

  const paginatedTags = paginateArray(tags, 6);

  useEffect(() => {
    if (onSearchChange) onSearchChange(debouncedSearch);
  }, [debouncedSearch]);

  const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
      <Box pt={8} pb={32} minH="full">
        <Flex
          alignItems="center"
          gap={4}
          px={8}
          pb={4}
          borderBottomWidth={1}
          borderBottomColor="cje-gray.400"
        >
          <IconButton
            variant="unstyled"
            mt={1}
            icon={<Icon as={HiChevronLeft} w={6} h={6} />}
            aria-label="Retour à l'accueil"
            onClick={() => {
              if (fromWidget) {
                router.push("/widget");
              } else {
                router.push("/dashboard");
              }
            }}
          />
          <SearchBar
            search={search}
            setSearch={setSearch}
            inputProps={{ autoFocus: true }}
            placeholder={fromWidget ? "Rechercher" : undefined}
          />
        </Flex>
        <Box mb={6}>
          <BannerEndApp />
        </Box>
        {children}
      </Box>
    );
  };

  if (isLoadingTags || isLoadingOffers || isSearchDebounced)
    return (
      <Layout>
        <Center h="full" w="full">
          <LoadingLoader />
        </Center>
      </Layout>
    );

  return <Layout>{children(paginatedTags, partners, debouncedSearch)}</Layout>;
};

export default SearchWrapper;
