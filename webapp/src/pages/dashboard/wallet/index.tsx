import {
	Box,
	Center,
	Flex,
	Heading,
	Icon,
	TabPanel,
	Text,
} from "@chakra-ui/react";
import LoadingLoader from "~/components/LoadingLoader";
import OfferCard from "~/components/cards/OfferCard";
import WalletWrapper from "~/components/wrappers/WalletWrapper";
import { api } from "~/utils/api";
import { PiSmileySadFill } from "react-icons/pi";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Offer } from "~/payload/payload-types";
import { push } from "@socialgouv/matomo-next";

const WalletNoData = ({ kind }: { kind: Offer["kind"] }) => {
	return (
		<Box textAlign="center" mt={40} px={8}>
			<Heading size="md" mt={1} mb={2}>
				Commencez à activer des offres pour les retrouver ici !
			</Heading>
			<Text color="gray.500">
				Activez les offres qui vous intéressent celles à utiliser {kind === "voucher" ? "en magasin 🛒" : "en ligne 🛍️"} vont s’afficher ici
			</Text>
		</Box>
	);
};

export default function Wallet() {
	const router = useRouter();
	const { offerKind } = router.query as {
		offerKind?: Offer["kind"];
	};

	const [tabIndex, setTabIndex] = useState(2);

	useEffect(() => {
		setTabIndex(offerKind === "voucher" ? 0 : offerKind === "code" ? 1 : 2);
	}, [offerKind]);

	const handleTabsChange = (index: number) => {
		router.replace({
			query: { offerKind: index === 0 ? "voucher" : "code" },
		});
		push([
			"trackEvent",
			"Mes réductions",
			`${index === 0 ? "En magasin" : "En ligne"}`,
		]);
		setTabIndex(index);
	};

	if (
		(!offerKind || (offerKind !== "voucher" && offerKind !== "code")) &&
		router.isReady
	) {
		router.replace({
			query: {
				...router.query,
				offerKind: "voucher",
			},
		});
	}

	const { data: resultUserOffers, isLoading: isLoadingUserOffers } =
		api.offer.getListOfAvailables.useQuery({
			page: 1,
			perPage: 50,
			sort: "partner.name",
			isCurrentUser: true,
		});

	const { data: currentUserOffers } = resultUserOffers || {};

	const inStoreOffers = currentUserOffers?.filter((offer) =>
		offer.kind.startsWith("voucher")
	);

	const onlineOffers = currentUserOffers?.filter((offer) =>
		offer.kind.startsWith("code")
	);

	if (isLoadingUserOffers) {
		return (
			<WalletWrapper tabIndex={tabIndex} handleTabsChange={handleTabsChange}>
				<Center h="full" w="full">
					<LoadingLoader />
				</Center>
			</WalletWrapper>
		);
	}

	return (
		<WalletWrapper tabIndex={tabIndex} handleTabsChange={handleTabsChange}>
			<TabPanel p={0}>
				{inStoreOffers && inStoreOffers.length > 0 ? (
					<Flex flexDir="column" gap={6}>
						{inStoreOffers?.map((offer) => (
							<OfferCard key={offer.id} offer={offer} displayExpiryDate />
						))}
					</Flex>
				) : (
					<WalletNoData kind="voucher" />
				)}
			</TabPanel>
			<TabPanel p={0}>
				{onlineOffers && onlineOffers.length > 0 ? (
					<Flex flexDir="column" gap={6}>
						{onlineOffers?.map((offer) => (
							<OfferCard key={offer.id} offer={offer} displayExpiryDate />
						))}
					</Flex>
				) : (
					<WalletNoData kind="code" />
				)}
			</TabPanel>
		</WalletWrapper>
	);
}
