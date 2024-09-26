import { Button, Flex, Icon } from "@chakra-ui/react";
import { ErrorOption, SubmitHandler, useForm } from "react-hook-form";
import FormInput from "../forms/FormInput";
import { frenchPhoneNumber } from "~/utils/tools";
import { HiArrowRight } from "react-icons/hi2";
import { push } from "@socialgouv/matomo-next";

export type LoginForm = {
  phone_number: string;
};

export type ComponentPhoneNumberKeys =
  | "phone-number-cta"
  | "phone-number-footer";

const PhoneNumberCTA = ({
  onSubmit,
  currentKey,
  setCurrentPhoneNumberKey,
  error,
  isLoadingOtp,
}: {
  onSubmit: SubmitHandler<LoginForm>;
  currentKey: ComponentPhoneNumberKeys;
  setCurrentPhoneNumberKey: React.Dispatch<
    React.SetStateAction<ComponentPhoneNumberKeys>
  >;
  error: {
    name: ComponentPhoneNumberKeys;
    error: ErrorOption;
  } | null;
  isLoadingOtp: boolean;
}) => {
  const {
    handleSubmit,
    register,
    setError,
    formState: { errors },
  } = useForm<LoginForm>({
    mode: "onSubmit",
  });

  if (currentKey === error?.name && errors.phone_number === undefined) {
    setError("phone_number", {
      type: error.error.type,
      message: error.error.message,
    });
  }

  return (
    <Flex
      key={currentKey}
      as="form"
      flexDir={{ base: "column", lg: "row" }}
      mr={{ base: 0, lg: currentKey === "phone-number-cta" ? 12 : 0 }}
      alignItems="center"
      shadow="landing-phone-number-component"
      borderRadius="1.125rem"
      mt={{ base: 6, lg: 16 }}
      p={2}
      onSubmit={(e: any) => {
        e.preventDefault();
        setCurrentPhoneNumberKey(currentKey);
        handleSubmit(onSubmit)();
      }}
    >
      <FormInput
        wrapperProps={{ w: "full" }}
        inputProps={{
          className: currentKey,
          bgColor: { base: "white", lg: "transparent" },
          fontSize: { base: "md", lg: "xl" },
        }}
        field={{
          name: "phone_number",
          kind: "tel",
          placeholder: "Mon numéro de téléphone",
          prefix: "🇫🇷",
          rules: {
            required: "Ce champ est obligatoire",
            pattern: {
              value: frenchPhoneNumber,
              message:
                "On dirait que ce numéro de téléphone n’est pas valide. Vérifiez votre numéro",
            },
          },
        }}
        fieldError={errors.phone_number}
        register={register}
      />
      <Button
        mt={{ base: 4, lg: 0 }}
        w={{ base: "full", lg: "full" }}
        colorScheme="blackBtn"
        px={0}
        type="submit"
        fontSize={{ base: "md", lg: "2xl" }}
        py={{ base: "inherit", lg: 9 }}
        isLoading={isLoadingOtp}
        onClick={() => {
          push([
            "trackEvent",
            "Landing",
            `Vérifier mon éligibilité ${currentKey === "phone-number-footer" ? "2" : ""}`,
          ]);
        }}
        rightIcon={<Icon as={HiArrowRight} w={6} h={6} />}
      >
        Vérifier mon éligibilité
      </Button>
    </Flex>
  );
};

export default PhoneNumberCTA;
