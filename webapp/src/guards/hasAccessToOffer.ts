import { type GetServerSideProps } from "next";
import { appRouter } from "~/server/api/root";
import getPayloadClient from "~/payload/payloadClient";
import { PayloadJwtSession, createCallerFactory } from "~/server/api/trpc";
import { jwtDecode } from "jwt-decode";

export const hasAccessToOffer: GetServerSideProps = async (context) => {
  const payload = await getPayloadClient({ seed: false });

  const jwtCookie =
    context.req.cookies[process.env.NEXT_PUBLIC_JWT_NAME ?? "cje-jwt"];

  if (!jwtCookie) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const session = jwtDecode<PayloadJwtSession>(jwtCookie);

  const createCaller = createCallerFactory(appRouter);

  const caller = createCaller({ payload, session });

  const { data: offerListAvailables } = await caller.offer.getListOfAvailables({
    offerId: parseInt(context.params?.id as string),
    page: 1,
    perPage: 1,
  });

  if (offerListAvailables?.length === 0) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const { data: myCoupon } = await caller.coupon.getOne({
    offer_id: parseInt(context.params?.id as string),
  });

  if (!myCoupon && !context.query["couponStatus"]) {
    await caller.offer.increaseNbSeen({
      offer_id: parseInt(context.params?.id as string),
    });
  }

  return {
    props: {},
  };
};
