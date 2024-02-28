import {
  Box,
  Button,
  Center,
  Divider,
  Flex,
  HStack,
  Icon,
  Spinner,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  VStack,
  useDisclosure,
  useSteps,
} from "@chakra-ui/react";
import { useGSAP } from "@gsap/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import {
  HiArrowRight,
  HiBuildingStorefront,
  HiOutlineInformationCircle,
  HiQuestionMarkCircle,
  HiShoppingCart,
} from "react-icons/hi2";
import ChakraNextImage from "~/components/ChakraNextImage";
import LoadingLoader from "~/components/LoadingLoader";
import NewPassComponent from "~/components/NewPassComponent";
import { PassIcon } from "~/components/icons/pass";
import BaseModal from "~/components/modals/BaseModal";
import StackItems, { StackItem } from "~/components/offer/StackItems";
import StepsButtons from "~/components/offer/StepsButtons";
import CouponWrapper from "~/components/wrappers/CouponWrapper";
import OfferWrapper from "~/components/wrappers/OfferWrapper";
import StepsWrapper from "~/components/wrappers/StepsWrapper";
import { getItemsTermsOfUse } from "~/payload/components/CustomSelectField";
import { useAuth } from "~/providers/Auth";
import { couponAnimation } from "~/utils/animations";
import { api } from "~/utils/api";
import { getItemsExternalLink } from "~/utils/itemsOffer";

export default function Dashboard() {
  const { user } = useAuth();

  const router = useRouter();
  const { id } = router.query;

  const [timeoutIdExternalLink, setTimeoutIdExternalLink] =
    useState<NodeJS.Timeout>();

  const { data: resultOffer, isLoading: isLoadingOffer } =
    api.offer.getById.useQuery(
      {
        id: parseInt(id as string),
      },
      { enabled: id !== undefined }
    );

  const {
    data: resultCoupon,
    isLoading: isLoadingCoupon,
    refetch: refetchCoupon,
  } = api.coupon.getOne.useQuery(
    {
      offer_id: parseInt(id as string),
    },
    { enabled: id !== undefined }
  );

  const { data: offer } = resultOffer || {};
  const { data: coupon } = resultCoupon || {};

  const { mutate: mutateCouponToUser, isSuccess } =
    api.coupon.assignToUser.useMutation({
      onSuccess: () => refetchCoupon(),
    });

  const itemsTermsOfUse = useMemo(() => {
    if (!offer) return [];
    return getItemsTermsOfUse(offer.kind).filter((item) =>
      offer.termsOfUse?.map((termOfUse) => termOfUse.slug).includes(item.slug)
    ) as StackItem[];
  }, [offer]);

  const itemsExternalLink = useMemo(() => {
    if (!offer) return [];
    return getItemsExternalLink(offer.kind);
  }, [offer]);

  const nbSteps = useMemo(() => {
    if (!offer) return 2;
    return offer.conditions?.length ? 2 : 1;
  }, [offer]);

  const { activeStep, setActiveStep } = useSteps({
    index: 1,
    count: nbSteps,
  });

  const [isOpenNewPassComponent, setIsOpenNewPassComponent] = useState(false);

  const {
    isOpen: isOpenActivateOffer,
    onOpen: onOpenActivateOffer,
    onClose: onCloseActivateOffer,
  } = useDisclosure();

  const {
    isOpen: isOpenTermsOfUse,
    onOpen: onOpenTermsOfUse,
    onClose: onCloseTermsOfUse,
  } = useDisclosure();

  const {
    isOpen: isOpenOtherConditions,
    onOpen: onOpenOtherConditions,
    onClose: onCloseOtherConditions,
  } = useDisclosure();

  const {
    isOpen: isOpenExternalLink,
    onOpen: onOpenExternalLink,
    onClose: onCloseExternalLink,
  } = useDisclosure({
    onOpen: () => {
      const timeoutId = setTimeout(() => {
        window.open(offer?.partner.url, "_blank");
        onCloseExternalLink();
      }, 1000);
      setTimeoutIdExternalLink(timeoutId);
    },
    onClose: () => clearTimeout(timeoutIdExternalLink),
  });

  useGSAP(
    () => {
      couponAnimation(isSuccess, !!coupon);
    },
    { dependencies: [isLoadingCoupon, coupon, isSuccess] }
  );

  const handleActivateOffer = () => {
    if (
      offer?.kind.startsWith("voucher") &&
      user?.status_image !== "approved"
    ) {
      setIsOpenNewPassComponent(true);
    } else {
      onOpenActivateOffer();
    }
  };

  const handleValidateOffer = (offerId: number) => {
    mutateCouponToUser({ offer_id: offerId });
    onCloseActivateOffer();
  };

  if (isLoadingOffer || !offer || isLoadingCoupon)
    return (
      <OfferWrapper>
        <Center h="full">
          <LoadingLoader />
        </Center>
      </OfferWrapper>
    );

  return (
    <OfferWrapper offer={offer} isModalOpen={isOpenActivateOffer}>
      <CouponWrapper
        coupon={coupon}
        offer={offer}
        handleOpenOtherConditions={onOpenOtherConditions}
        handleActivateOffer={handleActivateOffer}
        handleOpenExternalLink={onOpenExternalLink}
      >
        {offer.kind.startsWith("voucher") && (
          <>
            <Divider my={6} />
            <VStack spacing={3} align="start">
              <HStack spacing={4}>
                <Icon as={HiBuildingStorefront} w={6} h={6} />
                <Text fontWeight="extrabold">Magasins participants</Text>
              </HStack>
              <Text fontWeight="medium">
                {offer.nbOfEligibleStores ?? 1} magasins {offer.partner.name}{" "}
                participants
              </Text>
              <Image
                src={offer.imageOfEligibleStores.url as string}
                alt={offer.imageOfEligibleStores.alt as string}
                width={0}
                height={114}
                sizes="100vw"
                style={{ width: "100%" }}
              />
              <Link href={offer.linkOfEligibleStores ?? ""} target="_blank">
                <HStack align="center" borderBottom="1px solid black">
                  <Text fontWeight="medium">
                    Voir les magasins participants
                  </Text>
                  <Icon as={HiArrowRight} w={4} h={4} />
                </HStack>
              </Link>
            </VStack>
          </>
        )}
        <Divider my={6} />
        <HStack spacing={4}>
          <Button
            className="btn-conditions"
            size="sm"
            w="full"
            colorScheme="cje-gray"
            color="black"
            onClick={onOpenTermsOfUse}
          >
            <Flex flexDir="column" alignItems="center" gap={3}>
              <Icon as={HiQuestionMarkCircle} w={6} h={6} />
              <Text fontWeight="bold" fontSize="sm" px={4}>
                Comment ça marche ?
              </Text>
            </Flex>
          </Button>
          {offer.kind.startsWith("voucher") && (
            <Button
              isDisabled
              className="btn-conditions"
              size="sm"
              w="full"
              colorScheme="cje-gray"
              color="black"
              onClick={onOpenTermsOfUse}
            >
              <Flex flexDir="column" alignItems="center" gap={3}>
                <Icon as={HiShoppingCart} w={6} h={6} />
                <Text fontWeight="bold" fontSize="sm" px={4}>
                  Articles éligibles
                </Text>
              </Flex>
            </Button>
          )}
        </HStack>
        {!!(offer.conditions ?? []).length && (
          <>
            <Divider my={6} />
            <Flex flexDir="column" gap={2}>
              <HStack spacing={4}>
                <Icon as={HiOutlineInformationCircle} w={6} h={6} />
                <Text fontWeight="extrabold">Conditions</Text>
              </HStack>
              <Text fontWeight="medium" my={2}>
                <Text>
                  {(offer.conditions ?? []).slice(0, 2).map((condition) => (
                    <Text mb={2}>
                      {condition.text}
                      <br />
                    </Text>
                  ))}
                </Text>
              </Text>
              {(offer.conditions ?? []).length > 2 && (
                <HStack
                  spacing={1}
                  w="fit-content"
                  borderBottom="1px solid black"
                  onClick={onOpenOtherConditions}
                >
                  <Text as="span" fontWeight="medium">
                    Lire la suite
                  </Text>
                  <Icon as={HiArrowRight} w={4} h={4} />
                </HStack>
              )}
            </Flex>
          </>
        )}
      </CouponWrapper>
      <BaseModal
        onClose={onCloseActivateOffer}
        isOpen={isOpenActivateOffer}
        hideCloseBtn
      >
        <StepsWrapper
          stepContext={{ current: activeStep, total: nbSteps }}
          onBack={() =>
            activeStep !== 1
              ? setActiveStep(activeStep - 1)
              : onCloseActivateOffer()
          }
        >
          <Tabs
            index={activeStep - 1}
            onChange={(index) => setActiveStep(index)}
            h="full"
          >
            <TabPanels h="full">
              <TabPanel as={Flex} flexDir="column" h="full" px={0}>
                <Text fontSize="2xl" fontWeight="extrabold">
                  Comment bénificier de cette offre ?
                </Text>
                <StackItems items={itemsTermsOfUse} props={{ mt: 6 }} />
                <StepsButtons
                  activeStep={activeStep}
                  setActiveStep={setActiveStep}
                  count={nbSteps}
                  mainBtnText="J'ai compris"
                  handleValidate={() => handleValidateOffer(offer.id)}
                  onClose={onCloseActivateOffer}
                />
              </TabPanel>
              <TabPanel as={Flex} flexDir="column" h="full" px={0}>
                <Text fontSize="2xl" fontWeight="extrabold">
                  Conditions de cette offre {offer.partner.name}
                </Text>
                <StackItems items={offer.conditions ?? []} props={{ mt: 6 }} />
                <StepsButtons
                  activeStep={activeStep}
                  setActiveStep={setActiveStep}
                  count={nbSteps}
                  mainBtnText="J'active cette offre"
                  handleValidate={() => handleValidateOffer(offer.id)}
                  onClose={onCloseActivateOffer}
                />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </StepsWrapper>
      </BaseModal>
      <BaseModal
        onClose={onCloseTermsOfUse}
        isOpen={isOpenTermsOfUse}
        title="Comment bénéficier de cette offre ?"
      >
        <StackItems items={itemsTermsOfUse} props={{ mt: 6 }} />
      </BaseModal>
      <BaseModal
        onClose={onCloseOtherConditions}
        isOpen={isOpenOtherConditions}
        title={`Conditions de cette offre ${offer.partner.name}`}
      >
        <StackItems items={offer.conditions ?? []} props={{ mt: 6 }} />
      </BaseModal>
      <BaseModal
        onClose={onCloseExternalLink}
        isOpen={isOpenExternalLink}
        title={`Nous vous redirigeons vers le site ${offer.partner.name}`}
      >
        <Flex flexDir="column">
          <Flex position="relative" mt={16}>
            <Spinner
              mx="auto"
              thickness="8px"
              speed="0.85s"
              emptyColor="gray.200"
              color="blackLight"
              boxSize={40}
            />
            <Box
              bgColor="white"
              objectFit="cover"
              objectPosition="center"
              position="absolute"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
              p={2}
              borderRadius="full"
            >
              <ChakraNextImage
                src={offer.partner.icon.url as string}
                alt={offer.partner.icon.alt as string}
                width={12}
                height={12}
              />
            </Box>
          </Flex>
          <StackItems items={itemsExternalLink} props={{ mt: 16 }} />
        </Flex>
      </BaseModal>
      <NewPassComponent
        isOpen={isOpenNewPassComponent}
        onClose={() => setIsOpenNewPassComponent(false)}
      />
    </OfferWrapper>
  );
}
