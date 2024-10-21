import { Button, Flex, Heading, Icon } from "@chakra-ui/react";
import Cookies from "js-cookie";
import NextImage from "next/image";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { HiArrowTopRightOnSquare } from "react-icons/hi2";

export default function WidgetMagicLinkPage() {
  const router = useRouter();
  const [isCookieSet, setIsCookieSet] = useState<boolean>(false);

  useEffect(() => {
    const { widgetToken: initialToken } = router.query;
    if (initialToken) {
      Cookies.set(
        process.env.NEXT_PUBLIC_WIDGET_TOKEN_NAME!,
        initialToken as string,
        {
          expires: 7,
          path: "/",
          secure: true,
          sameSite: "none",
        }
      );
      setIsCookieSet(true);
    }
  }, [router.query, router]);

  useEffect(() => {
    if (isCookieSet) {
      const newQuery = { ...router.query };
      delete newQuery.widgetToken;
      router.replace(
        {
          pathname: router.pathname,
          query: newQuery,
        },
        undefined,
        { shallow: true }
      );
    }
  }, [isCookieSet]);

  if (!isCookieSet) return;

  return (
    <Flex
      direction={"column"}
      bg="primary"
      pt={18}
      pb={40}
      px={8}
      alignItems="center"
      minH="full"
    >
      <Flex mt={16} px={6} direction={"column"} alignItems={"center"}>
        <Flex flexWrap={"wrap"} gap={6} mb={4}>
          <NextImage
            src="/images/landing/ministere-travail-blanc.png"
            alt="Logo marianne du gouvernement français"
            width={70}
            height={70}
          />
          <NextImage
            src="/images/cje-logo-white-blue.svg"
            alt="Logo de l'application Carte Jeune Engagé"
            width={60}
            height={33}
          />
        </Flex>
        <Heading size={"xl"} color="white" textAlign={"center"} my={10}>
          Tous les codes de réduction sont dans l’appli carte “jeune engagé”
        </Heading>
        <Button
          as={NextLink}
          href={`/?widgetToken=${Cookies.get(process.env.NEXT_PUBLIC_WIDGET_TOKEN_NAME!)}`}
          target="_blank"
          colorScheme="whiteBtn"
          color="black"
          fontWeight={800}
          w="full"
          mt={10}
        >
          Accéder à l'application <Icon ml={2} as={HiArrowTopRightOnSquare} />
        </Button>
      </Flex>
    </Flex>
  );
}
