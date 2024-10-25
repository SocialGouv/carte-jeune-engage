import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import {
  Controller,
  FieldError,
  FormProvider,
  SubmitHandler,
  useForm,
  useFormContext,
} from "react-hook-form";
import { SignupFormData, signupFormSchema } from "~/utils/form/formSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FieldMetadata,
  FormStep,
  generateSteps,
} from "~/utils/form/formHelpers";
import {
  Box,
  Button,
  Center,
  Flex,
  Heading,
  Icon,
  Text,
} from "@chakra-ui/react";
import OnBoardingStepsWrapper from "~/components/wrappers/OnBoardingStepsWrapper";
import FormInput from "~/components/forms/FormInput";
import FormBlock from "~/components/forms/FormBlock";
import useDebounceValueWithState from "~/hooks/useDebounceCallbackWithPending";
import { useQuery } from "@tanstack/react-query";
import FormAutocompleteInput from "~/components/forms/FormAutocompleteInput";
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

const FormField: React.FC<{
  field: FieldMetadata & { name: string; path: string[] };
  setIsAutocompleteInputFocused: Dispatch<SetStateAction<boolean>>;
}> = ({ field, setIsAutocompleteInputFocused }) => {
  const {
    control,
    register,
    setError,
    clearErrors,
    formState: { errors },
    watch,
  } = useFormContext<SignupFormData>();
  const error = errors[field.name as keyof SignupFormData];
  const value = watch(field.name as keyof SignupFormData);

  switch (field.kind) {
    case "text":
    case "email":
    case "date":
      return (
        <FormInput
          key={field.name}
          register={register}
          field={field}
          fieldError={error as FieldError}
        />
      );
    case "radio":
      return (
        <>
          <Controller
            control={control}
            name={field.name as keyof SignupFormData}
            render={({ field: { onChange, value } }) => (
              <Flex
                gap={4}
                flexDir={field.variant == "inline" ? "column" : "row"}
              >
                {field.options?.map((option) => (
                  <FormBlock
                    key={`${field.name}-${option.value}`}
                    value={option.value}
                    kind="radio"
                    currentValue={value}
                    variant={field.variant}
                    iconSrc={option.iconSrc}
                    onChange={onChange}
                  >
                    {option.label}
                  </FormBlock>
                ))}
              </Flex>
            )}
          />
          {error && (
            <Text color="red" fontSize="sm" mt={2}>
              {error.message}
            </Text>
          )}
        </>
      );
    case "checkbox":
      return (
        <Flex flexDir="column" alignItems="center" w="full" gap={2} pb={32}>
          {field.options?.map((option, index) => (
            <Controller
              key={option.value}
              control={control}
              name={`preferences.${index}`}
              render={({ field: { onChange } }) => (
                <FormBlock
                  value={option.value}
                  currentValue={value}
                  kind="checkbox"
                  variant={field.variant}
                  iconSrc={option.iconSrc}
                  onChange={onChange}
                  withCheckbox
                >
                  {option.label}
                </FormBlock>
              )}
            />
          ))}
        </Flex>
      );
    case "autocomplete":
      const [debouncedAddress, isDebouncePending] = useDebounceValueWithState(
        value as string,
        500
      );

      const { data: addressOptions, isLoading: isLoadingAddressOptions } =
        useQuery(
          ["getAddressOptions", debouncedAddress],
          async () => {
            const formatedDebouncedAddress = debouncedAddress.split(",")[0];
            const response = await fetch(
              `https://geo.api.gouv.fr/communes?nom=${formatedDebouncedAddress}&codeDepartement=95&fields=departement&limit=5`
            );
            const data = await response.json();
            return data.map(
              (municipality: any) =>
                `${municipality.nom}, ${municipality.departement.nom}`
            ) as string[];
          },
          {
            enabled: !!debouncedAddress && debouncedAddress.length > 2,
          }
        );

      return (
        <FormAutocompleteInput
          control={control}
          options={addressOptions}
          setError={setError}
          clearErrors={clearErrors}
          isLoading={isLoadingAddressOptions || isDebouncePending}
          field={field}
          fieldError={error as FieldError}
          setIsInputFocused={setIsAutocompleteInputFocused}
        />
      );
    default:
      return null;
  }
};

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

  const [hasAcceptedCGU, setHasAcceptedCGU] = useLocalStorage(
    "cje-signup-cgu",
    false
  );
  const [isLoading, setIsLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<FormStep>(generateSteps(signupFormSchema));

  const defaultValues = useMemo(() => {
    return typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("cje-signup-form") as string)
      : { preferences: [] };
  }, [typeof window !== "undefined"]);

  const methods = useForm<SignupFormData>({
    resolver: zodResolver(signupFormSchema),
    mode: "onBlur",
    defaultValues,
  });

  const { mutateAsync: updateUser } = api.user.update.useMutation();
  const { data: resultTags } = api.globals.tagsListOrdered.useQuery();
  const { data: tags } = resultTags || { data: [] };

  const activeStep = steps[currentStep];
  const isActiveStepPreferences = activeStep.fields[0].name === "preferences";
  const formValues = methods.getValues();

  const [isAutocompleteInputFocused, setIsAutocompleteInputFocused] =
    useState(false);

  const onSubmit: SubmitHandler<SignupFormData> = (data) => {
    updateUser({
      ...data,
      preferences: data.preferences.filter(Boolean).map(Number),
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
            { expires: new Date((data.exp as number) * 1000) }
          );
          refetchUser().then(() => {
            localStorage.removeItem("cje-signup-cgu");
            localStorage.removeItem("cje-signup-form");
            router.push("/dashboard");
            if (!!user && !user.notification_status && !isIOS()) {
              setShowNotificationModal(true);
            } else {
              setShowSplashScreenModal(true);
            }
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
      setSteps(generateSteps(signupFormSchema));
    }
  }, [tags]);

  useEffect(() => {
    const localStorageSignupStep =
      JSON.parse(localStorage.getItem("cje-signup-form") as string)
        ?.signupStepNumber ?? 0;

    if (!signupStep || typeof signupStep !== "string") {
      console.log("signupStep is not a string");
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
  }, [signupStep, router.isReady]);

  if (isLoading)
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
          style={{ height: "100%" }}
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
              {!isAutocompleteInputFocused && (
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
                {activeStep.fields.map((field, index) => (
                  <Box key={field.name} mt={index != 0 ? 10 : 0}>
                    <FormField
                      field={field}
                      setIsAutocompleteInputFocused={
                        setIsAutocompleteInputFocused
                      }
                    />
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
                type={currentStep === steps.length - 1 ? "submit" : "button"}
                onClick={
                  currentStep === steps.length - 1 ? undefined : handleNext
                }
                rightIcon={<Icon as={HiArrowRight} w={6} h={6} />}
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
