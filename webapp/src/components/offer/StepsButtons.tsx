import { Button, VStack } from "@chakra-ui/react";
import { push } from "@socialgouv/matomo-next";
import { useState } from "react";
import { OfferIncluded } from "~/server/api/routers/offer";

type StepsButtonsProps = {
  mainBtnText: string;
  activeStep: number;
  count: number;
  offer: OfferIncluded;
  setActiveStep: (index: number) => void;
  handleValidate?: () => Promise<void>;
  isValidateSuccess?: boolean;
  onClose: () => void;
};

const StepsButtons = ({
  mainBtnText,
  handleValidate,
  isValidateSuccess,
  onClose,
  activeStep,
  setActiveStep,
  offer,
  count,
}: StepsButtonsProps) => {
  const [isValidating, setIsValidating] = useState(false);

  const handleOnClose = () => {
    setActiveStep(1);
    onClose();
  };

  return (
    <VStack
      spacing={6}
      bottom={0}
      pb={6}
      position={"fixed"}
      w="full"
      left={0}
      px={4}
      bg={"bgWhite"}
      pt={4}
    >
      <Button
        onClick={() => {
          if (activeStep !== count) {
            push([
              "trackEvent",
              "Offre",
              `${offer.partner.name}`,
              `${offer.title}`,
              "Inactive",
              "J'active mon offre",
              "J'ai compris",
            ]);
            setActiveStep(activeStep + 1);
          } else if (handleValidate) {
            push([
              "trackEvent",
              "Offre",
              `${offer.partner.name}`,
              `${offer.title}`,
              "Inactive",
              "J'active mon offre - Validation",
            ]);
            setIsValidating(true);
            handleValidate().then(() => setIsValidating(false));
          }
        }}
        isLoading={isValidating}
        isDisabled={isValidateSuccess}
        w="full"
      >
        {activeStep !== count ? "J'ai compris" : mainBtnText}
      </Button>
      <Button
        onClick={() => {
          push([
            "trackEvent",
            "Offre",
            `${offer.partner.name}`,
            `${offer.title}`,
            "Inactive",
            "J'active mon offre",
            `Cette offre ne m'intéresse pas ${activeStep === count ? "2" : ""}`,
          ]);
          handleOnClose();
        }}
        variant="ghost"
        colorScheme="btnWhite"
        size="md"
        w="full"
      >
        Cette offre ne m'interesse pas
      </Button>
    </VStack>
  );
};

export default StepsButtons;
