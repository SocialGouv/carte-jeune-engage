import { Button, Flex, Heading, Icon, Text } from "@chakra-ui/react";
import { GetServerSideProps } from "next";
import NextImage from "next/image";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { HiArrowTopRightOnSquare } from "react-icons/hi2";
import { TbX } from "react-icons/tb";
import OfferCard from "~/components/cards/OfferCard";
import { ScrollAnimatedPerspectiveBox } from "~/components/offer/ScrollAnimatedPerspectiveBox";
import BackButton from "~/components/ui/BackButton";
import { api } from "~/utils/api";

export default function WidgetOfferPage({
  widgetToken,
}: {
  widgetToken: string;
}) {
  const router = useRouter();
  const { id } = router.query;

  const { data: resultOffer } = api.offer.getById.useQuery(
    {
      id: parseInt(id as string),
    },
    { enabled: id !== undefined }
  );
  const { data: offer } = resultOffer || {};

  if (!offer) return;

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
      <Flex w="full" mb={6}>
        <BackButton icon={TbX} />
      </Flex>
      <ScrollAnimatedPerspectiveBox>
        <OfferCard
          offer={offer}
          matomoEvent={[
            "Accueil",
            "Pour vous",
            `Offre - ${offer.partner.name} - ${offer.title} `,
          ]}
          fromWidget
          light
        />
      </ScrollAnimatedPerspectiveBox>
      <Flex mt={16} px={6} direction={"column"} alignItems={"center"}>
        <NextImage
          src={"/pwa/appIcon/android-launchericon-192-192.png"}
          alt="Carte jeune engagé icone de l'application"
          width={92}
          height={92}
          style={{
            borderRadius: "1rem",
            boxShadow: "0px 24px 14px 0px #00000040",
          }}
        />
        <Text color="white" textAlign={"center"} mt={4}>
          Carte
          <br />
          “jeune engagé”
        </Text>
        <Heading size={"lg"} color="white" textAlign={"center"} mt={6}>
          Tous les codes de réduction sont dans l’appli carte “jeune engagé”
        </Heading>
        <Flex flexWrap={"wrap"} gap={6} mt={2}>
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
        <Button
          as={NextLink}
          href={`/login-widget?widgetToken=${widgetToken}&offer_id=${id}`}
          target="_blank"
          colorScheme="whiteBtn"
          color="black"
          fontWeight={800}
          w="full"
          mt={10}
        >
          Télécharger l'appli <Icon ml={2} as={HiArrowTopRightOnSquare} />
        </Button>
        <Button
          variant="unstyled"
          color="white"
          w="full"
          mt={2}
          onClick={() => router.back()}
        >
          Pas maintenant
        </Button>
      </Flex>
    </Flex>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  let { widgetToken } = context.query;
  if (!widgetToken)
    widgetToken =
      context.req.cookies[process.env.NEXT_PUBLIC_WIDGET_TOKEN_NAME!];

  if (!widgetToken || typeof widgetToken !== "string") {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {
      widgetToken,
    },
  };
};
