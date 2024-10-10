import { Flex } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Jumbotron from "~/components/landing/Jumbotron";
import { api } from "~/utils/api";
import Cookies from "js-cookie";
import { GetServerSideProps } from "next";
import jwt from "jsonwebtoken";
import CategoriesList from "~/components/lists/CategoriesList";

type WidgetProps = {
  initialToken: string;
};

export default function Widget({ initialToken }: WidgetProps) {
  const router = useRouter();
  const [isCookieSet, setIsCookieSet] = useState<boolean>(false);

  useEffect(() => {
    if (initialToken) {
      Cookies.set("widget-token", initialToken, {
        expires: 7,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
      setIsCookieSet(true);
    }
  }, [router.query, router]);

  const { data: resultOffersOnline, isLoading: isLoadingOffersOnline } =
    api.offer.getWidgetListOfAvailables.useQuery(
      {
        page: 1,
        perPage: 10,
        sort: "partner.name",
        kinds: ["code", "code_space"],
      },
      {
        enabled: isCookieSet,
      }
    );

  const { data: resultOffersInStore, isLoading: isLoadingOffersInStore } =
    api.offer.getWidgetListOfAvailables.useQuery(
      {
        page: 1,
        perPage: 10,
        sort: "partner.name",
        kinds: ["voucher", "voucher_pass"],
      },
      {
        enabled: isCookieSet,
      }
    );

  const { data: offersOnline } = resultOffersOnline || {};
  const { data: offersInStore } = resultOffersInStore || {};

  const allOffers = [...(offersOnline ?? []), ...(offersInStore ?? [])];

  return (
    <Flex direction={"column"} gap={4}>
      <Jumbotron />
      <CategoriesList offers={allOffers} baseLink="/widget/category" />
    </Flex>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const { widgetToken } = context.query;

    if (!widgetToken || typeof widgetToken !== "string") {
      return {
        redirect: {
          destination: "/",
          permanent: false,
        },
      };
    }

    const decoded = jwt.verify(widgetToken, process.env.WIDGET_SECRET_JWT!);

    return {
      props: {
        initialToken: widgetToken,
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
};
