import { GetServerSideProps } from "next";
import getPayloadClient from "~/payload/payloadClient";
import { createCallerFactory } from "~/server/api/trpc";
import { appRouter } from "~/server/api/root";

export const getServerSideProps = (async (context) => {
  const payload = await getPayloadClient({ seed: false });

  const { query } = context;
  const { token } = query;

  if (!token)
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };

  const createCaller = createCallerFactory(appRouter);

  const caller = createCaller({ payload, session: null });

  try {
    const { data: userSession } = await caller.emailAuthToken.verifyToken(
      token as string
    );

    context.res.setHeader(
      "Set-Cookie",
      `${process.env.NEXT_PUBLIC_JWT_NAME ?? "cje-jwt"}=${userSession.token}; Expires=${new Date(
        (userSession.exp as number) * 1000
      ).toUTCString()}; Path=/; SameSite=Strict`
    );

    return {
      redirect: {
        destination: "/dashboard",
        permanent: true,
      },
    };
  } catch (error) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }
}) satisfies GetServerSideProps;

export default function VerifyLoginEmail() {
  return null;
}
