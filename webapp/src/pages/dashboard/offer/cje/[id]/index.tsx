import { Center, useDisclosure, useToast } from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { IoCloseCircleOutline } from "react-icons/io5";
import CouponCard from "~/components/cards/CouponCard";
import OfferCard from "~/components/cards/OfferCard";
import LoadingLoader from "~/components/LoadingLoader";
import CouponContent from "~/components/offer/page/CouponContent";
import OfferContent from "~/components/offer/page/OfferContent";
import ToastComponent from "~/components/ToastComponent";
import OfferHeaderWrapper from "~/components/wrappers/OfferHeaderWrapper";
import { api } from "~/utils/api";
import { dateDiffInMinutes, isIOS, isOlderThan24Hours } from "~/utils/tools";

const flipVariants = {
  hidden: { rotateY: 90 },
  visible: { rotateY: 0 },
  exit: { rotateY: -90 },
};

export default function OfferCjePage() {
  const router = useRouter();
  const toast = useToast();

  const [couponErased, setCouponErased] = useState(false);

  const { id: offer_id } = router.query as { id: string };

  const { data: resultOffer, isLoading: isLoadingOffer } =
    api.offer.getById.useQuery(
      { id: parseInt(offer_id), source: "cje" },
      { enabled: !!offer_id }
    );

  const {
    data: resultCoupon,
    isLoading: isLoadingCoupon,
    refetch: refetchCoupon,
  } = api.coupon.getOne.useQuery(
    { offer_id: parseInt(offer_id) },
    { enabled: !!offer_id }
  );

  const { data: offer } = resultOffer || {};
  const { data: coupon } = resultCoupon || {};

  // There is 3 ways user see the "Voir mon code" button
  //		1 - User does not have a coupon assigned
  //		2 - User has an unused coupon assigned
  //		3 - User has a used coupon assigned but offer is cumulative
  const canTakeCoupon =
    !coupon ||
    (!!coupon && !coupon.used) ||
    (!!coupon && !!coupon.used && !!offer?.cumulative);

  const hasUnusedCoupon = !!coupon && !coupon.used;

  // Non cumulative offer
  const disabled = !offer?.cumulative && !!coupon && !!coupon.used;

  // Cumulative offer
  const cooldownInMinutes =
    !!offer?.cumulative &&
    !!coupon &&
    !!coupon.used &&
    !!coupon.assignUserAt &&
    !isOlderThan24Hours(coupon.assignUserAt)
      ? dateDiffInMinutes(
          new Date(),
          new Date(
            new Date(coupon.assignUserAt).getTime() + 24 * 60 * 60 * 1000
          )
        )
      : null;

  const { mutateAsync: increaseNbSeen } =
    api.offer.increaseNbSeen.useMutation();

  const {
    mutateAsync: mutateAsyncCouponToUser,
    isLoading: isLoadingCouponToUser,
  } = api.coupon.assignToUser.useMutation({
    onSuccess: () => {
      refetchCoupon();
    },
    onError: (error) => {
      if (error.data?.httpStatus === 404) {
        toast({
          render: () => (
            <ToastComponent
              bgColor="error"
              text="Plus aucun code disponible pour cette offre, redirection..."
              icon={IoCloseCircleOutline}
            />
          ),
          duration: 2000,
        });

        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      }
    },
  });

  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [kind, setKind] = useState<"offer" | "coupon">("offer");

  const offerPageSessionStartTime = new Date().getTime();

  const handleValidateOffer = async (
    offerId: number,
    displayCoupon: boolean = true
  ) => {
    if (hasUnusedCoupon) {
      setKind("coupon");
    } else if (canTakeCoupon) {
      try {
        await mutateAsyncCouponToUser({ offer_id: offerId });
        if (displayCoupon) setKind("coupon");
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleBookmarkOfferToUser = async () => {
    return await mutateAsyncCouponToUser({
      offer_id: parseInt(offer_id),
    });
  };

  const [timeoutIdExternalLink, setTimeoutIdExternalLink] =
    useState<NodeJS.Timeout>();
  const [intervalIdExternalLink, setIntervalIdExternalLink] =
    useState<NodeJS.Timeout>();
  const [timeoutProgress, setTimeoutProgress] = useState<number>(0);

  const onCouponUsed = () => {
    setCouponErased(true);
    setTimeout(() => {
      refetchCoupon();
      setKind("offer");
    }, 1200);
  };

  const {
    isOpen: isOpenExternalLink,
    onOpen: onOpenExternalLink,
    onClose: onCloseExternalLink,
  } = useDisclosure({
    onOpen: () => {
      const totalTimeout = 2000;
      const startTime = Date.now();

      const timeoutId = setTimeout(() => {
        clearInterval(intervalIdExternalLink);
        let a = document.createElement("a");
        document.body.appendChild(a);
        a.classList.add("hidden");
        a.href = coupon?.offer?.url as string;
        if (!isIOS()) a.target = "_blank";
        a.click();
        document.body.removeChild(a);
        onCloseExternalLink();
      }, totalTimeout);

      setTimeoutIdExternalLink(timeoutId);

      const intervalId = setInterval(() => {
        const currentTime = Date.now();
        const elapsedTime = currentTime - startTime;

        setTimeoutProgress(
          Math.min((elapsedTime / totalTimeout) * 100 + 20, 100)
        );

        if (elapsedTime >= totalTimeout) clearInterval(intervalId);
      }, 100);

      setIntervalIdExternalLink(intervalId);
    },
    onClose: () => {
      clearInterval(intervalIdExternalLink);
      setTimeoutProgress(0);
      clearTimeout(timeoutIdExternalLink);
    },
  });

  useEffect(() => {
    const mutateData = async () => {
      await increaseNbSeen({ offer_id: parseInt(offer_id) });
    };

    if (!!offer_id) mutateData();
  }, [offer_id]);

  useEffect(() => {
    if (
      !isLoadingOffer &&
      !isLoadingCoupon &&
      offer &&
      router.isReady &&
      !("offerKind" in router.query)
    ) {
      setIsFirstLoad(false);
    }
  }, [isLoadingOffer, isLoadingCoupon, offer, router.isReady, router.query]);

  useEffect(() => {
    const { offerKind } = router.query;
    if (offerKind === "coupon" && router.isReady && coupon) {
      setKind("coupon");
    }
  }, [router.isReady, isLoadingCoupon]);

  useEffect(() => {
    if (kind === "offer") {
      setCouponErased(false);
    }
  }, [kind]);

  if (isLoadingOffer || !offer || isLoadingCoupon || !router.isReady)
    return (
      <OfferHeaderWrapper
        kind="offer"
        setKind={setKind}
        handleBookmarkOfferToUser={handleBookmarkOfferToUser}
      >
        <Center h="full">
          <LoadingLoader />
        </Center>
      </OfferHeaderWrapper>
    );

  return (
    <OfferHeaderWrapper
      kind={kind}
      setKind={setKind}
      partnerColor={offer.partner.color}
      hasCoupon={!!coupon}
      headerComponent={
        <AnimatePresence mode="wait">
          <motion.div
            key={kind === "offer" || !coupon ? "offer" : "coupon"}
            initial={isFirstLoad ? undefined : "hidden"}
            animate={isFirstLoad ? undefined : "visible"}
            exit={isFirstLoad ? undefined : "exit"}
            variants={flipVariants}
            transition={{ duration: 0.4 }}
            style={{ perspective: 1000 }}
            layout
          >
            {kind === "offer" || !coupon ? (
              <motion.div style={{ backfaceVisibility: "hidden" }} layout>
                <OfferCard
                  offer={{ ...offer, userCoupon: coupon }}
                  variant="minimal"
                  handleValidateOffer={handleValidateOffer}
                />
              </motion.div>
            ) : (
              <motion.div style={{ backfaceVisibility: "hidden" }} layout>
                <CouponCard
                  erased={couponErased}
                  coupon={coupon}
                  handleOpenExternalLink={onOpenExternalLink}
                />
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      }
      offerPageSessionStartTime={offerPageSessionStartTime}
      handleBookmarkOfferToUser={handleBookmarkOfferToUser}
    >
      {kind === "offer" ? (
        <OfferContent
          offer={offer}
          handleValidateOffer={handleValidateOffer}
          isLoadingValidateOffer={isLoadingCouponToUser}
          hasUnusedCoupon={hasUnusedCoupon}
          canTakeCoupon={canTakeCoupon}
          cooldownInMinutes={cooldownInMinutes}
          disabled={disabled}
        />
      ) : (
        coupon && (
          <CouponContent
            offer={offer}
            coupon={coupon}
            isOpenExternalLink={isOpenExternalLink}
            onCloseExternalLink={onCloseExternalLink}
            onCouponUsed={onCouponUsed}
            timeoutProgress={timeoutProgress}
          />
        )
      )}
    </OfferHeaderWrapper>
  );
}
