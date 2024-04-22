import { ReactNode } from "react";
import Head from "next/head";
import { Button, Flex, Text, useTheme } from "@chakra-ui/react";
import { ChevronLeftIcon } from "@chakra-ui/icons";
import Image from "next/image";
import { OfferIncluded } from "~/server/api/routers/offer";
import { dottedPattern } from "~/utils/chakra-theme";
import { useRouter } from "next/router";
import { push } from "@socialgouv/matomo-next";

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
      <Flex flexDir="column" h="full">
        <Flex
          bgColor={offer?.partner.color}
          px={8}
          py={6}
          position="relative"
          sx={{ ...dottedPattern(bgWhiteColor) }}
          alignItems="center"
        >
          <Button
            position="absolute"
            colorScheme="whiteBtn"
            onClick={() => {
              push(["trackEvent", "Retour"]);
              if (window.history?.length > 1) {
                router.back();
              } else {
                router.push("/dashboard");
              }
            }}
            size="md"
            iconSpacing={0}
            px={0}
            rightIcon={<ChevronLeftIcon w={6} h={6} color="black" />}
          />
          <Flex mx="auto" alignItems="center" gap={3}>
            <Flex
              justifyContent="center"
              alignItems="center"
              bgColor="white"
              p={2}
              borderRadius="full"
            >
              <Image
                src={offer?.partner.icon.url as string}
                alt={offer?.partner.icon.alt as string}
                width={48}
                height={48}
                style={{
                  borderRadius: "50%",
                }}
              />
            </Flex>
            <Text fontSize="xl" fontWeight="bold" color="white">
              {offer?.partner.name}
            </Text>
          </Flex>
        </Flex>
        {children}
      </Flex>
    </>
  );
};

export default OfferWrapper;
