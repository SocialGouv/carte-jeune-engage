import { Center, useDisclosure } from "@chakra-ui/react";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useState } from "react";
import CouponCard from "~/components/cards/CouponCard";
import LoadingLoader from "~/components/LoadingLoader";
import OfferHeaderWrapper from "~/components/wrappers/OfferHeaderWrapper";
import { hasAccessToOffer } from "~/guards/hasAccessToOffer";
import { api } from "~/utils/api";
import { isIOS } from "~/utils/tools";

export const getServerSideProps: GetServerSideProps = async (context) => {
  return hasAccessToOffer(context);
};

export default function CouponPage() {
  const router = useRouter();

  const { id } = router.query as {
    id: string;
  };

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

  const { data: coupon } = resultCoupon || {};

  const [timeoutIdExternalLink, setTimeoutIdExternalLink] =
    useState<NodeJS.Timeout>();

  const {
    isOpen: isOpenExternalLink,
    onOpen: onOpenExternalLink,
    onClose: onCloseExternalLink,
  } = useDisclosure({
    onOpen: () => {
      const timeoutId = setTimeout(() => {
        let a = document.createElement("a");
        document.body.appendChild(a);
        a.classList.add("hidden");
        a.href = coupon?.offer?.url as string;
        if (!isIOS()) a.target = "_blank";
        a.click();
        document.body.removeChild(a);
        onCloseExternalLink();
      }, 2000);
      setTimeoutIdExternalLink(timeoutId);
    },
    onClose: () => clearTimeout(timeoutIdExternalLink),
  });

  if (isLoadingCoupon || !coupon)
    return (
      <OfferHeaderWrapper kind="coupon">
        <Center h="full">
          <LoadingLoader />
        </Center>
      </OfferHeaderWrapper>
    );

  return (
    <OfferHeaderWrapper
      kind="coupon"
      partnerColor={coupon.offer.partner.color}
      headerComponent={<CouponCard coupon={coupon} />}
    >
      <>
        Coupon {coupon.id} {coupon.user.firstName}
      </>
    </OfferHeaderWrapper>
  );
}
