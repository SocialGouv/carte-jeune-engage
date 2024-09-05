import { ReactNode } from "react";
import Head from "next/head";
import { Flex, IconButton, useTheme } from "@chakra-ui/react";
import { ChevronLeftIcon } from "@chakra-ui/icons";
import { OfferIncluded } from "~/server/api/routers/offer";
import { useRouter } from "next/router";
import { push } from "@socialgouv/matomo-next";
import OfferCard from "../cards/OfferCard";

type OfferWrapperProps = {
  children: ReactNode;
  offer?: OfferIncluded;
  isModalOpen?: boolean;
};

const OfferWrapper = ({ children, offer, isModalOpen }: OfferWrapperProps) => {
  const router = useRouter();

  const theme = useTheme();
  const bgWhiteColor = theme.colors.bgWhite;

  return (
    <>
      <Head>
        <meta
          name="theme-color"
          content={isModalOpen ? bgWhiteColor : offer?.partner.color}
        />
      </Head>
      <Flex flexDir="column">
        <Flex
          flexDir="column"
          bgColor={offer?.partner.color}
          px={8}
          pt={6}
          pb={8}
          gap={6}
        >
          <IconButton
            alignSelf="start"
            shadow="default"
            aria-label="Retour"
            colorScheme="whiteBtn"
            onClick={() => {
              push(["trackEvent", "Retour"]);
              if (window.history?.length > 1) {
                router.back();
              } else {
                router.push("/dashboard");
              }
            }}
            borderRadius="2.25xl"
            size="md"
            icon={<ChevronLeftIcon w={6} h={6} color="black" />}
          />
          {offer && <OfferCard offer={offer} />}
        </Flex>
        {children}
      </Flex>
    </>
  );
};

export default OfferWrapper;
