import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Icon,
  Text,
} from "@chakra-ui/react";
import { ErrorOption, SubmitHandler, useForm } from "react-hook-form";
import FormInput from "../forms/FormInput";
import { frenchPhoneNumber } from "~/utils/tools";
import { HiArrowRight } from "react-icons/hi2";
import { push } from "@socialgouv/matomo-next";

export type LoginForm = {
  phone_number: string;
  user_email?: string;
};

const PhoneNumberCTA = ({
  onSubmit,
  error,
  isLoadingOtp,
}: {
  onSubmit: SubmitHandler<LoginForm>;
  error?: ErrorOption;
  isLoadingOtp: boolean;
}) => {
  const {
    handleSubmit,
    register,
    setError,
    watch,
    formState: { errors },
  } = useForm<LoginForm>({
    mode: "onSubmit",
  });

  const phone_number = watch("phone_number");

  if (error && errors.phone_number === undefined) {
    setError("phone_number", {
      type: error.type,
      message: error.message,
    });
  }

  return (
    <Flex
      as="form"
      flexDir={{ base: "column", lg: "row" }}
      alignItems="center"
      borderRadius="1.125rem"
      p={2}
      onSubmit={(e: any) => {
        e.preventDefault();
        handleSubmit(onSubmit)();
      }}
    >
      <FormControl>
        <FormInput
          wrapperProps={{ w: "full" }}
          inputProps={{
            bgColor: { base: "white", lg: "transparent" },
            fontSize: { base: "md", lg: "xl" },
          }}
          field={{
            name: "phone_number",
            kind: "tel",
            placeholder: "06 00 00 00 00",
            label: "Mon n° de téléphone",
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
      </FormControl>
      <Button
        color={
          (!phone_number && phone_number === "") || isLoadingOtp
            ? "#ffffff40"
            : "white"
        }
        mt={{ base: 4, lg: 0 }}
        w={{ base: "full", lg: "full" }}
        colorScheme="blackBtn"
        px={0}
        type="submit"
        fontSize={{ base: "md", lg: "2xl" }}
        isLoading={isLoadingOtp}
        onClick={() => {
          push(["trackEvent", "Landing", `Vérifier mon éligibilité`]);
        }}
        rightIcon={<Icon as={HiArrowRight} w={6} h={6} />}
      >
        Suivant
      </Button>
    </Flex>
  );
};

export default PhoneNumberCTA;
