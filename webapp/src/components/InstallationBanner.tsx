import React from "react";
import {
  Box,
  Button,
  Center,
  Flex,
  Icon,
  Text,
  useToast,
} from "@chakra-ui/react";
import { useAuth } from "~/providers/Auth";
import { useLocalStorage } from "usehooks-ts";
import { FiX } from "react-icons/fi";
import { push } from "@socialgouv/matomo-next";
import { HiMiniArrowDownTray } from "react-icons/hi2";
import Image from "next/image";

type Props = {
  ignoreUserOutcome: boolean;
  matomoEvent?: string[];
};

const InstallationBanner: React.FC<Props> = ({
  ignoreUserOutcome,
  matomoEvent = [],
}) => {
  // overlay show state
  const toast = useToast();
  const { user } = useAuth();
  const [userOutcome, setUserOutcome] = useLocalStorage<
    "accepted" | "dismissed" | null
  >("cje-pwa-user-outcome", null);

  const { showing, deferredEvent, setShowing, setDeferredEvent } = useAuth();

  async function handleInstallClick() {
    if (!!matomoEvent.length) push(["trackEvent", ...matomoEvent]);

    if (deferredEvent) {
      await deferredEvent.prompt();
      const { outcome } = await deferredEvent.userChoice;
      setUserOutcome(outcome);
      setDeferredEvent(null);
    } else {
      toast({
        title: "Installation failed, please try again later!",
        status: "error",
      });
    }

    setShowing(false);
  }

  if (
    !showing ||
    user === null ||
    (!ignoreUserOutcome && userOutcome === "dismissed")
  )
    return null;

  return (
    <Center
      flexDir="column"
      mb={4}
      p={4}
      borderRadius="2.5xl"
      bgColor="primary"
      color="white"
      textAlign="center"
      position="relative"
    >
      {!ignoreUserOutcome && (
        <Icon
          as={FiX}
          ml="auto"
          h={6}
          w={6}
          onClick={() => setUserOutcome("dismissed")}
        />
      )}
      <Text fontSize={18} fontWeight={800} mt={4}>
        Téléchargez l’appli,
        <br />
        elle est plus agréable
      </Text>
      <Box
        mt={11}
        mb={24}
        shadow="installation-banner-icon"
        borderRadius="2.5xl"
        zIndex={2}
      >
        <Image
          src="/pwa/appIcon/maskable_icon_x192.png"
          alt="Logo de l'appli cje"
          width={72}
          height={72}
          style={{
            borderRadius: "20px",
            position: "relative",
          }}
        />
      </Box>
      <Button
        size="lg"
        mb={5}
        zIndex={2}
        fontSize={16}
        fontWeight={800}
        color="black"
        colorScheme="whiteBtn"
        rightIcon={<Icon as={HiMiniArrowDownTray} w={5} h={5} />}
        onClick={handleInstallClick}
      >
        Télécharger l'appli
      </Button>
      <Image
        src="/images/dashboard/installation-banner-background-phone.png"
        alt="Téléphone avec l'appli cje"
        width={0}
        height={0}
        sizes="100vw"
        style={{
          width: "100%",
          height: "160px",
          position: "absolute",
          zIndex: 1,
          objectFit: "none",
          top: "60%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />
    </Center>
  );
};

export default InstallationBanner;
