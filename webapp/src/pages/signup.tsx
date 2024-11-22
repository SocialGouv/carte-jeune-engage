import { useEffect, useMemo, useState } from "react";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import {
  SignupFormData,
  signupFormSchema,
  SignupWidgetFormData,
  signupWidgetFormSchema,
} from "~/utils/form/formSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormStep, generateSteps } from "~/utils/form/formHelpers";
import {
  Box,
  Button,
  Center,
  Divider,
  Flex,
  Heading,
  Icon,
  Text,
} from "@chakra-ui/react";
import OnBoardingStepsWrapper from "~/components/wrappers/OnBoardingStepsWrapper";
import { motion } from "framer-motion";
import { HiArrowRight } from "react-icons/hi2";
import Image from "next/image";
import { api } from "~/utils/api";
import { getCookie, setCookie } from "cookies-next";
import { useAuth } from "~/providers/Auth";
import { useRouter } from "next/router";
import { isIOS } from "~/utils/tools";
import LoadingLoader from "~/components/LoadingLoader";
import CGUAcceptContent from "~/components/signup/cguAcceptContent";
import { useLocalStorage } from "usehooks-ts";
import FormField from "~/components/forms/FormField";

const SignupPage: React.FC = () => {
  const router = useRouter();
  const {
    user,
    refetchUser,
    setShowSplashScreenModal,
    setShowNotificationModal,
  } = useAuth();

  const { signupStep } = router.query as {
    signupStep: string | undefined;
  };

  const onBoardingKind = useMemo(() => {
    if (!!user?.cej_id)
      return { name: "widget", schema: signupWidgetFormSchema } as const;
    return { name: "base", schema: signupFormSchema } as const;
  }, [user]);

  const [hasAcceptedCGU, setHasAcceptedCGU] = useLocalStorage(
    "cje-signup-cgu",
    false
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<FormStep[]>([]);

  const defaultValues = useMemo(() => {
    if (typeof window !== "undefined") {
      let existingFormValues = JSON.parse(
        localStorage.getItem("cje-signup-form") as string
      );

      if (
        existingFormValues?.preferences &&
        Array.isArray(existingFormValues?.preferences)
      ) {
        existingFormValues.preferences = existingFormValues?.preferences.filter(
          (p: string | undefined) => p !== undefined && p !== null
        );
      }

      return existingFormValues;
    }
    return { preferences: [] };
  }, [typeof window !== "undefined"]);

  const methods = useForm({
    resolver: zodResolver(onBoardingKind.schema),
    mode: onBoardingKind.name === "widget" ? "onSubmit" : "onBlur",
    defaultValues,
  });

  const { mutateAsync: updateUser } = api.user.update.useMutation();
  const { data: resultTags } = api.globals.tagsListOrdered.useQuery();
  const { data: tags } = resultTags || { data: [] };

  const activeStep = steps[currentStep] ?? { fields: [] };
  const isActiveStepPreferences = activeStep.fields[0]?.name === "preferences";
  const formValues = methods.getValues();

  const [isAutocompleteInputFocused, setIsAutocompleteInputFocused] =
    useState(false);

  const onSubmit: SubmitHandler<SignupFormData | SignupWidgetFormData> = (
    data
  ) => {
    setIsSubmitting(true);

    if (onBoardingKind.name === "widget") {
      const isValid = Object.keys(methods.formState.errors).length === 0;

      if (!isValid) {
        setIsSubmitting(false);
        return;
      }
    }

    updateUser({
      ...data,
      preferences:
        "preferences" in data
          ? data.preferences.filter(Boolean).map(Number)
          : [],
      cejFrom: "cejFrom" in data ? data.cejFrom : "missionLocale",
    }).then(() => {
      const jwtToken = getCookie(process.env.NEXT_PUBLIC_JWT_NAME ?? "cje-jwt");
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
            { expires: new Date((data.exp as number) * 1000), sameSite: "lax" }
          );
          refetchUser().then(() => {
            localStorage.removeItem("cje-signup-cgu");
            localStorage.removeItem("cje-signup-form");
            if (!!user && !user.notification_status && !isIOS()) {
              setShowNotificationModal(true);
            } else {
              setShowSplashScreenModal(true);
            }
            setIsSubmitting(false);
          });
        });
      });
    });
  };

  const handleNextStep = () => {
    localStorage.setItem(
      "cje-signup-form",
      JSON.stringify({
        ...methods.getValues(),
        signupStepNumber: currentStep + 1,
      })
    );
    router.replace({ query: { signupStep: currentStep + 1 } });
    setCurrentStep((prev) => prev + 1);
  };

  const handleNext = async () => {
    const currentFields = activeStep.fields
      .filter((field) => field.kind !== "checkbox")
      .map((field) => field.name);

    const isValid =
      (await methods.trigger(currentFields as (keyof SignupFormData)[])) &&
      Object.keys(methods.formState.errors).filter((errorKey) =>
        currentFields.includes(errorKey)
      ).length === 0;

    if (isValid && currentStep < steps.length - 1) {
      handleNextStep();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      router.replace({ query: { signupStep: currentStep - 1 } });
      setCurrentStep((prev) => prev - 1);
    }
  };

  useEffect(() => {
    if (tags && tags.length > 0) {
      signupFormSchema.shape.preferences.meta.options = tags.map((tag) => ({
        label: tag.label,
        value: tag.id.toString(),
        iconSrc: tag.icon.url as string,
      }));
      setSteps(generateSteps(onBoardingKind.schema));
    }
  }, [tags]);

  useEffect(() => {
    const localStorageSignupStep =
      JSON.parse(localStorage.getItem("cje-signup-form") as string)
        ?.signupStepNumber ?? 0;

    if (!signupStep || typeof signupStep !== "string" || steps.length === 0) {
      if (router.isReady) {
        router.replace({
          query: { signupStep: localStorageSignupStep },
        });
        setIsLoading(false);
      }
      return;
    }

    const signupStepNumber = parseInt(signupStep);

    if (signupStepNumber > localStorageSignupStep) {
      router.replace({ query: { signupStep: localStorageSignupStep } });
      setIsLoading(false);
      return;
    }

    if (signupStepNumber < 0 || signupStepNumber >= steps.length) {
      router.back();
      return;
    }

    setCurrentStep(signupStepNumber);
    setIsLoading(false);
  }, [signupStep, router.isReady, steps]);

  if (isLoading || !user)
    return (
      <OnBoardingStepsWrapper
        stepContext={{ current: currentStep + 1, total: steps.length }}
        onBack={handlePrevious}
      >
        <Center w="full" h="full">
          <LoadingLoader />
        </Center>
      </OnBoardingStepsWrapper>
    );

  if (!hasAcceptedCGU)
    return <CGUAcceptContent onClick={() => setHasAcceptedCGU(true)} />;

  return (
    <OnBoardingStepsWrapper
      stepContext={{ current: currentStep + 1, total: steps.length }}
      onBack={handlePrevious}
    >
      <FormProvider {...methods}>
        <form
          onSubmit={methods.handleSubmit(onSubmit)}
          style={{
            height: onBoardingKind.name === "base" ? "100%" : "auto",
          }}
        >
          <Flex
            display="flex"
            flexDir="column"
            py={12}
            px={8}
            justifyContent="space-between"
            gap={8}
            h="full"
          >
            <Flex flexDir="column" h="full">
              <Heading
                as="h1"
                size="lg"
                fontWeight="extrabold"
                textAlign="center"
              >
                {activeStep.title}
              </Heading>
              {!isAutocompleteInputFocused &&
                onBoardingKind.name === "base" && (
                  <>
                    <Text
                      fontSize={14}
                      fontWeight="medium"
                      color="secondaryText"
                      mt={4}
                    >
                      {activeStep.description}
                    </Text>
                    {activeStep.imageSrc && (
                      <Center mt={2}>
                        <Image
                          src={activeStep.imageSrc}
                          alt={activeStep.title as string}
                          width={126}
                          height={0}
                        />
                      </Center>
                    )}
                  </>
                )}
              <Flex flexDir="column" mt={6}>
                {activeStep.fields.map((field, index, arr) => (
                  <Box
                    key={field.name}
                    mt={index != 0 && onBoardingKind.name === "base" ? 10 : 2}
                  >
                    <FormField
                      field={field}
                      setIsAutocompleteInputFocused={
                        setIsAutocompleteInputFocused
                      }
                    />
                    {index != 0 &&
                      index !== arr.length - 1 &&
                      onBoardingKind.name === "widget" && <Divider mt={4} />}
                  </Box>
                ))}
              </Flex>
            </Flex>
            <Box
              alignSelf="center"
              w={isActiveStepPreferences ? "fit-content" : "full"}
              mt="auto"
              sx={{
                position: isActiveStepPreferences ? "fixed" : "relative",
                left: isActiveStepPreferences ? "50%" : "auto",
                transform: isActiveStepPreferences
                  ? "translateX(-50%)"
                  : "none",
                bottom: isActiveStepPreferences ? 10 : "auto",
              }}
            >
              <Button
                as={motion.button}
                whileTap={{ scale: 0.95 }}
                animate={{
                  transition: { type: "spring", stiffness: 400, damping: 5 },
                }}
                colorScheme="blackBtn"
                isDisabled={
                  isActiveStepPreferences &&
                  formValues.preferences?.filter(Boolean).length === 0
                }
                w={isActiveStepPreferences ? "fit-content" : "full"}
                type="button"
                onClick={
                  currentStep === steps.length - 1
                    ? methods.handleSubmit(onSubmit)
                    : handleNext
                }
                rightIcon={<Icon as={HiArrowRight} w={6} h={6} />}
                isLoading={isSubmitting}
              >
                Suivant
              </Button>
            </Box>
          </Flex>
        </form>
      </FormProvider>
    </OnBoardingStepsWrapper>
  );
};

export default SignupPage;
