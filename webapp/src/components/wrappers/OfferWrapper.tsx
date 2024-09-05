import { ReactNode } from "react";
import Head from "next/head";
import {
  Button,
  Fade,
  Flex,
  Icon,
  IconButton,
  useTheme,
} from "@chakra-ui/react";
import { ChevronLeftIcon } from "@chakra-ui/icons";
import { OfferIncluded } from "~/server/api/routers/offer";
import { useRouter } from "next/router";
import { push } from "@socialgouv/matomo-next";
import OfferCard from "../cards/OfferCard";
import { HiMiniEye, HiOutlineBookmark } from "react-icons/hi2";
import { useIntersectionObserver } from "usehooks-ts";

type OfferWrapperProps = {
  children: ReactNode;
  offer?: OfferIncluded;
  isModalOpen?: boolean;
};

const OfferWrapper = ({ children, offer, isModalOpen }: OfferWrapperProps) => {
  const router = useRouter();

  const theme = useTheme();
  const bgWhiteColor = theme.colors.bgWhite;

  const { isIntersecting, ref: intersectionRef } = useIntersectionObserver({
    threshold: 0.2,
  });

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
          ref={intersectionRef}
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
        <Fade in={!isIntersecting} style={{ zIndex: 10 }}>
          <Flex
            position="fixed"
            zIndex={10}
            alignItems="center"
            bottom={0}
            insetX={0}
            bg="white"
            borderTopColor="cje-gray.300"
            borderTopWidth={1}
            py={4}
            px={4}
            gap={4}
          >
            <Button
              colorScheme="whiteBtn"
              w="40%"
              fontSize={16}
              variant="outline"
              color="blackLight"
              borderColor="cje-gray.300"
              leftIcon={<Icon as={HiOutlineBookmark} w={5} h={5} />}
            >
              Enregistrer
            </Button>
            <Button
              w="60%"
              fontSize={16}
              colorScheme="blackBtn"
              leftIcon={<Icon as={HiMiniEye} w={5} h={5} />}
            >
              Voir mon code
            </Button>
          </Flex>
        </Fade>
      </Flex>
    </>
  );
};

export default OfferWrapper;
