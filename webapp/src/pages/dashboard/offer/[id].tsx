import { jwtDecode } from "jwt-decode";
import { GetServerSideProps, NextApiRequest } from "next";
import getPayloadClient from "~/payload/payloadClient";
import { appRouter } from "~/server/api/root";
import { createCallerFactory, PayloadJwtSession } from "~/server/api/trpc";

export const getServerSideProps: GetServerSideProps = async ({
  query,
  req,
}) => {
  const order_id = query.id;

  const jwtCookie = req.cookies[process.env.NEXT_PUBLIC_JWT_NAME ?? "cje-jwt"];

  if (!order_id || typeof order_id !== "string" || !jwtCookie) {
    return {
      redirect: {
        destination: "/dashboard",
        permanent: false,
      },
    };
  }

  const payload = await getPayloadClient({ seed: false });

  const session = jwtDecode<PayloadJwtSession>(jwtCookie);

  const createCaller = createCallerFactory(appRouter);
  const caller = createCaller({
    payload,
    session,
    soapObizClient: null,
    req: req as NextApiRequest,
  });

  try {
    const { data: offers } = await caller.offer.getListOfAvailables({
      page: 1,
      perPage: 1,
      offerIds: [parseInt(order_id)],
    });

    if (offers.length !== 1) {
      return {
        redirect: {
          destination: "/dashboard",
          permanent: false,
        },
      };
    }

    const currentOffer = offers[0];

    return {
      redirect: {
        destination: `/dashboard/offer/${currentOffer.source}/${order_id}`,
        permanent: false,
      },
    };
  } catch (error) {
    console.log("Error in offer redirect :", error);
    return {
      redirect: {
        destination: "/dashboard",
        permanent: false,
      },
    };
  }
};

export const OfferRedirect = () => {
  return null;
};

export default OfferRedirect;
