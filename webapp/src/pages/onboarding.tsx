import {
  Box,
  Button,
  Center,
  Flex,
  Heading,
  Icon,
  Input,
  SimpleGrid,
  Text,
} from "@chakra-ui/react";
import { useForm, type SubmitHandler, Controller } from "react-hook-form";
import FormInput, { type FieldProps } from "~/components/forms/FormInput";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { HiArrowRight, HiCheck, HiCheckCircle } from "react-icons/hi2";
import LoadingLoader from "~/components/LoadingLoader";
import FormBlock from "~/components/forms/FormBlock";
import OnBoardingStepsWrapper from "~/components/wrappers/OnBoardingStepsWrapper";
import { signupSteps } from "./signup";
import { api } from "~/utils/api";
import { getCookie, setCookie } from "cookies-next";
import { useAuth } from "~/providers/Auth";

type OnBoardingForm = {
  cejFrom: string;
  timeAtCEJ: string;
  hasAJobIdea: string;
  projectTitle?: string;
  projectDescription?: string;
  preferences: string[];
};

export type OnBoardingFormStep = {
  title: string;
  description?: string;
  field: FieldProps;
  optional?: boolean;
};

export const onBoardingSteps = [
  {
    title:
      "Vous êtes en Contrat d'engagement jeune (CEJ) avec quel établissement ?",
    field: {
      name: "cejFrom",
      kind: "select",
      label: "Quel établissement",
    },
  },
  {
    title: "Depuis combien de temps êtes vous en CEJ ?",
    field: {
      name: "timeAtCEJ",
      kind: "select",
      label: "Depuis combien de temps",
    },
  },
  {
    title:
      "Vous avez déjà une idée de formation ou de métier à la fin du CEJ ?",
    field: {
      name: "hasAJobIdea",
      kind: "select",
      label: "Pense à une idée de formation ou métier",
    },
  },
  {
    title:
      "Dites-nous ce que vous voulez faire et les réductions qui pourraient vous aider !",
    optional: true,
    description:
      "Nous allons bientôt ajouter des réductions pour vos formations et projet professionnels dites-nous ce dont vous avez besoin !",
    field: {
      name: "projectTitle",
      kind: "text",
      label: "Votre projet ? Electricien, tatoueur...",
    },
  },
  {
    title: "Sur quoi voulez-vous le plus faire des économies ?",
    description:
      "Nous allons vous présenter les meilleures réductions en fonction de vos préférences dans votre appli.",
    field: {
      name: "preferences",
      kind: "select",
      label: "Prénom",
    },
  },
] as const;

export default function OnBoarding() {
  const router = useRouter();

  const { user, refetchUser, setShowModalInstallApp } = useAuth();

  const [hasAcceptedCGU, setHasAcceptedCGU] = useState<boolean>(false);
  const { onBoardingStep } = router.query as {
    onBoardingStep: keyof OnBoardingForm | undefined;
  };

  const { mutateAsync: updateUser, isLoading: isLoadingUpdateUser } =
    api.user.update.useMutation();

  const [finishedOnBoarding, setFinishedOnBoarding] = useState(false);
  const [currentOnBoardingStep, setCurrentOnBoardingStep] =
    useState<OnBoardingFormStep | null>(null);

  const defaultValues = useMemo(() => {
    return typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("cje-onboarding-form") as string)
      : {};
  }, [typeof window !== "undefined"]);

  const {
    handleSubmit,
    getValues,
    watch,
    control,
    formState: { errors },
    register,
  } = useForm<OnBoardingForm>({
    mode: "onBlur",
    defaultValues,
  });

  const onSubmit: SubmitHandler<OnBoardingForm> = (data) => {
    if (!currentOnBoardingStep) return;
    const currentStepIndex = onBoardingSteps.findIndex(
      (step) => step.field.name === currentOnBoardingStep.field.name
    );
    if (currentStepIndex === onBoardingSteps.length - 1) {
      const tmpData: any = data;
      tmpData.preferences = data.preferences.filter(Boolean).map(Number);
      updateUser(tmpData).then(() => {
        const jwtToken = getCookie(
          process.env.NEXT_PUBLIC_JWT_NAME ?? "cje-jwt"
        );
        if (!jwtToken) return;

        fetch("/api/users/refresh-token", {
          method: "POST",
          credentials: "omit",
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }).then((req) => {
          req.json().then((data) => {
            setCookie(
              process.env.NEXT_PUBLIC_JWT_NAME ?? "cje-jwt",
              data.refreshedToken as string,
              { expires: new Date((data.exp as number) * 1000) }
            );
            refetchUser();
            setFinishedOnBoarding(true);
          });
        });
      });
    } else {
      let nextStep = onBoardingSteps[currentStepIndex + 1];
      if (!nextStep) return;
      if (
        nextStep.field.name === "projectTitle" &&
        formValues.hasAJobIdea === "no"
      ) {
        nextStep = onBoardingSteps[currentStepIndex + 2];
      }
      if (!nextStep) return;
      router.push({ query: { onBoardingStep: nextStep.field.name } });
      setCurrentOnBoardingStep(nextStep);
    }
  };

  const formValues = watch();

  const filteredPreferences = formValues.preferences?.filter(Boolean) || [];

  const { data: resultCategories } = api.category.getList.useQuery({
    page: 1,
    perPage: 100,
    sort: "createdAt",
  });

  const { data: categories } = resultCategories || {};

  useEffect(() => {
    localStorage.setItem(
      "cje-onboarding-form",
      JSON.stringify({ ...formValues })
    );
  }, [formValues]);

  useEffect(() => {
    if (!onBoardingStep || typeof onBoardingStep !== "string") {
      if (router.isReady)
        router.replace({
          query: { onBoardingStep: onBoardingSteps[0].field.name },
        });
      return;
    }

    const onBoardingStepNames = onBoardingSteps.map((step) => step.field.name);

    const tmpCurrentSignupStep = onBoardingSteps.find(
      (step) => step.field.name === onBoardingStep
    );

    if (
      !onBoardingStepNames.includes(onBoardingStep as any) ||
      !tmpCurrentSignupStep
    ) {
      router.back();
      return;
    }

    setCurrentOnBoardingStep(tmpCurrentSignupStep);
  }, [onBoardingStep, router.isReady]);

  if (!currentOnBoardingStep)
    return (
      <Center w="full" h="full">
        <LoadingLoader />
      </Center>
    );

  if (finishedOnBoarding)
    return (
      <Box h="full">
        <Center h="full" px={8}>
          <Flex
            flexDir="column"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            gap={4}
          >
            <Icon as={HiCheckCircle} w={12} h={12} color="blackLight" />
            <Text fontWeight="extrabold" fontSize="2xl">
              Tout est bon {user?.firstName} !
            </Text>
            <Text fontWeight="medium" color="secondaryText">
              Vous allez maintenant pouvoir accéder à toutes les réductions
              exclusives de la carte jeune engagé.
            </Text>
          </Flex>
        </Center>
        <Button
          colorScheme="blackBtn"
          position="fixed"
          bottom={12}
          left={"50%"}
          transform="translateX(-50%)"
          type="button"
          onClick={() => {
            localStorage.removeItem("cje-signup-form");
            localStorage.removeItem("cje-onboarding-form");
            setShowModalInstallApp(true);
            router.push("/dashboard");
          }}
          rightIcon={<Icon as={HiArrowRight} w={6} h={6} />}
        >
          Accéder aux réductions
        </Button>
      </Box>
    );

  const currentFieldValue = getValues(
    currentOnBoardingStep.field.name as keyof OnBoardingForm
  );

  const displayStep = () => {
    if (currentOnBoardingStep.field.name === "cejFrom") {
      return (
        <Flex flexDir="column" alignItems="center" w="full" gap={6}>
          <Controller
            control={control}
            name={currentOnBoardingStep.field.name}
            render={({ field: { onChange, value } }) => (
              <>
                <FormBlock
                  value="franceTravail"
                  currentValue={value}
                  onChange={onChange}
                >
                  à France Travail (ex Pôle emploi)
                </FormBlock>
                <FormBlock
                  value="missionLocale"
                  currentValue={value}
                  onChange={onChange}
                >
                  à la Mission locale
                </FormBlock>
              </>
            )}
          />
        </Flex>
      );
    }

    if (currentOnBoardingStep.field.name === "hasAJobIdea") {
      return (
        <Flex alignItems="center" w="full" gap={4}>
          <Controller
            control={control}
            name={currentOnBoardingStep.field.name}
            render={({ field: { onChange, value } }) => (
              <>
                <FormBlock value="yes" currentValue={value} onChange={onChange}>
                  Oui
                </FormBlock>
                <FormBlock value="no" currentValue={value} onChange={onChange}>
                  Non pas encore
                </FormBlock>
              </>
            )}
          />
        </Flex>
      );
    }

    if (currentOnBoardingStep.field.name === "projectTitle") {
      return (
        <Flex flexDir="column" alignItems="center" w="full" gap={6}>
          <FormInput register={register} field={currentOnBoardingStep.field} />
          <FormInput
            register={register}
            field={{
              kind: "textarea",
              name: "projectDescription",
              label:
                "Sur quoi voulez des réductions ? Du matériel ?  Des outils ?",
            }}
            inputProps={{
              isRequired: false,
            }}
          />
        </Flex>
      );
    }

    if (currentOnBoardingStep.field.name === "timeAtCEJ") {
      return (
        <Flex flexDir="column" alignItems="center" w="full" gap={6}>
          <Controller
            control={control}
            name={currentOnBoardingStep.field.name}
            render={({ field: { onChange, value } }) => (
              <>
                <FormBlock
                  value="started"
                  currentValue={value}
                  onChange={onChange}
                >
                  Je viens de commencer
                </FormBlock>
                <FormBlock
                  value="lessThan3Months"
                  currentValue={value}
                  onChange={onChange}
                >
                  Ça fait - de 3 mois
                </FormBlock>
                <FormBlock
                  value="moreThan3Months"
                  currentValue={value}
                  onChange={onChange}
                >
                  Ça fait + de 3 mois
                </FormBlock>
              </>
            )}
          />
        </Flex>
      );
    }

    if (currentOnBoardingStep.field.name === "preferences") {
      return (
        <Box pb={36}>
          <Flex
            alignItems="center"
            fontSize="sm"
            fontWeight="medium"
            color="secondaryText"
          >
            {filteredPreferences.length === 0 ? (
              "Sélectionnez au moins 3 thématiques"
            ) : filteredPreferences.length > 0 &&
              filteredPreferences.length < 3 ? (
              `Sélectionnez encore ${
                3 - filteredPreferences.length
              } thématique${3 - filteredPreferences.length > 1 ? "s" : ""}`
            ) : (
              <>
                3 sélectionnés
                <Icon as={HiCheck} w={5} h={5} ml={2} />
              </>
            )}
          </Flex>
          <SimpleGrid columns={2} mt={4} spacing={4} overflowY="auto" h="full">
            {categories?.map((category, index) => (
              <Controller
                key={category.id}
                control={control}
                name={`preferences.${index}`}
                render={({ field: { onChange } }) => (
                  <FormBlock
                    value={category.id.toString()}
                    currentValue={formValues.preferences}
                    iconSrc={category.icon.url as string}
                    onChange={
                      filteredPreferences.length >= 3 &&
                      currentFieldValue &&
                      !currentFieldValue.includes(category.id.toString())
                        ? () => {}
                        : onChange
                    }
                  >
                    {category.label}
                  </FormBlock>
                )}
              />
            ))}
          </SimpleGrid>
        </Box>
      );
    }
  };

  return (
    <OnBoardingStepsWrapper
      stepContext={{
        isFirstStep:
          onBoardingSteps.findIndex(
            (step) => step.field.name === currentOnBoardingStep.field.name
          ) === 0,
        current:
          onBoardingSteps.findIndex(
            (step) => step.field.name === currentOnBoardingStep.field.name
          ) +
          signupSteps.length +
          1,
        total: onBoardingSteps.length + signupSteps.length,
      }}
    >
      <Box as="form" onSubmit={handleSubmit(onSubmit)} h="full">
        <Flex
          display="flex"
          flexDir="column"
          pt={8}
          pb={currentOnBoardingStep.optional ? 6 : 12}
          px={6}
          justifyContent="space-between"
          h="full"
        >
          <Flex flexDir="column" justifyContent="center">
            <Heading as="h1" size="md" fontWeight="extrabold" mb={4}>
              {currentOnBoardingStep?.title}
            </Heading>
            {currentOnBoardingStep?.description && (
              <Text fontSize="sm" fontWeight="medium" color="secondaryText">
                {currentOnBoardingStep.description}
              </Text>
            )}
            <Box mt={6} key={currentOnBoardingStep.field.name}>
              {displayStep()}
            </Box>
          </Flex>
          <Flex direction={"column"}>
            <Button
              colorScheme="blackBtn"
              isDisabled={
                !currentFieldValue ||
                errors[currentOnBoardingStep.field.name as keyof OnBoardingForm]
                  ?.message !== undefined
              }
              position={onBoardingStep === "preferences" ? "fixed" : "relative"}
              bottom={onBoardingStep === "preferences" ? 12 : undefined}
              left={onBoardingStep === "preferences" ? "50%" : undefined}
              transform={
                onBoardingStep === "preferences"
                  ? "translateX(-50%)"
                  : undefined
              }
              hidden={
                onBoardingStep === "preferences" &&
                filteredPreferences.length < 3
              }
              isLoading={isLoadingUpdateUser}
              type="submit"
              rightIcon={<Icon as={HiArrowRight} w={6} h={6} />}
            >
              {onBoardingStep === "preferences"
                ? "Accéder aux réductions"
                : "Continuer"}
            </Button>
            {currentOnBoardingStep.optional && (
              <Button
                colorScheme="transparent"
                mt={2}
                color="blackBtn.500"
                onClick={handleSubmit(onSubmit)}
              >
                Passer cette question
              </Button>
            )}
          </Flex>
        </Flex>
      </Box>
    </OnBoardingStepsWrapper>
  );
}
