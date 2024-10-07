import React from "react";
import { Button, Flex, Icon, Text, useToast } from "@chakra-ui/react";
import { useAuth } from "~/providers/Auth";
import { useLocalStorage } from "usehooks-ts";
import { FiX } from "react-icons/fi";
import { push } from "@socialgouv/matomo-next";

type Props = {
  ignoreUserOutcome: boolean;
  theme?: "light" | "dark";
  matomoEvent?: string[];
};

const InstallationBanner: React.FC<Props> = ({
  ignoreUserOutcome,
  theme = "light",
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
    <Flex
      flexDir="column"
      mb={4}
      p={4}
      gap={3}
      borderRadius="1.5xl"
      bgColor={theme === "light" ? "cje-gray.500" : "blackLight"}
      color={theme === "light" ? "black" : "white"}
    >
      <Flex alignItems="flex-start">
        <Text fontSize="lg" fontWeight="bold" w="85%">
          Ajouter l’application sur votre téléphone
        </Text>
        {!ignoreUserOutcome && (
          <Icon
            as={FiX}
            ml="auto"
            h={7}
            w={7}
            onClick={() => setUserOutcome("dismissed")}
          />
        )}
      </Flex>
      <Text fontSize="sm" fontWeight="medium">
        Créer un raccourci sur votre téléphone pour pouvoir accéder à toutes vos
        promotions simplement et rapidement.
      </Text>
      <Button
        size="lg"
        mt={3}
        py={3}
        fontSize="md"
        fontWeight="bold"
        color="black"
        colorScheme="whiteBtn"
        onClick={handleInstallClick}
      >
        Ajouter l’application sur l’accueil
      </Button>
    </Flex>
  );
};

export default InstallationBanner;
