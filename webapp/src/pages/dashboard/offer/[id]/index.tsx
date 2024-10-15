import { Center, useDisclosure } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import CouponCard from "~/components/cards/CouponCard";
import OfferCard from "~/components/cards/OfferCard";
import LoadingLoader from "~/components/LoadingLoader";
import OfferHeaderWrapper from "~/components/wrappers/OfferHeaderWrapper";
import { api } from "~/utils/api";
import { isIOS } from "~/utils/tools";
import { motion, AnimatePresence } from "framer-motion";
import OfferContent from "~/components/offer/page/OfferContent";
import CouponContent from "~/components/offer/page/CouponContent";

const flipVariants = {
  hidden: { rotateY: 90 },
  visible: { rotateY: 0 },
  exit: { rotateY: -90 },
};

export default function OfferPage() {
  const router = useRouter();

  const { id } = router.query as {
    id: string;
  };

  const { data: resultOffer, isLoading: isLoadingOffer } =
    api.offer.getById.useQuery(
      { id: parseInt(id) },
      { enabled: id !== undefined }
    );

  const {
    data: resultCoupon,
    isLoading: isLoadingCoupon,
    refetch: refetchCoupon,
  } = api.coupon.getOne.useQuery(
    { offer_id: parseInt(id as string) },
    { enabled: id !== undefined }
  );

  const { data: offer } = resultOffer || {};
  const { data: coupon } = resultCoupon || {};

  const {
    mutateAsync: mutateAsyncCouponToUser,
    isLoading: isLoadingCouponToUser,
  } = api.coupon.assignToUser.useMutation({
    onSuccess: () => refetchCoupon(),
  });

  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [kind, setKind] = useState<"offer" | "coupon">("offer");

  const offerPageSessionStartTime = new Date().getTime();

  const handleValidateOffer = async (
    offerId: number,
    displayCoupon: boolean = true
  ) => {
    if (!coupon) await mutateAsyncCouponToUser({ offer_id: offerId });
    else if (coupon && coupon.used) return;
    if (displayCoupon) setKind("coupon");
  };

  const handleBookmarkOfferToUser = async () => {
    return await mutateAsyncCouponToUser({
      offer_id: parseInt(id),
    });
  };

  const [timeoutIdExternalLink, setTimeoutIdExternalLink] =
    useState<NodeJS.Timeout>();
  const [intervalIdExternalLink, setIntervalIdExternalLink] =
    useState<NodeJS.Timeout>();
  const [timeoutProgress, setTimeoutProgress] = useState<number>(0);

  const onCouponUsed = () => {
    refetchCoupon();
    setKind("offer");
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
        a.target = "_blank";
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

  if (isLoadingOffer || isLoadingCoupon || !offer || !router.isReady)
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
                  offer={offer}
                  variant="minimal"
                  handleValidateOffer={handleValidateOffer}
                  disabled={(coupon && coupon.used) || false}
                />
              </motion.div>
            ) : (
              <motion.div style={{ backfaceVisibility: "hidden" }} layout>
                <CouponCard
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
          coupon={coupon}
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
