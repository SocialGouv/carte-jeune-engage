import { Box, Button, Icon, Text } from "@chakra-ui/react";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { HiArrowRight } from "react-icons/hi2";
import FormInput from "~/components/forms/FormInput";
import SupervisorFormWrapper from "~/components/wrappers/SupervisorFormWrapper";
import { api } from "~/utils/api";
import { frenchPhoneNumber } from "~/utils/tools";

type SignUpForm = {
  phone_number: string;
};

export default function Home() {
  const [submitted, setSubmitted] = useState(false);

  const {
    handleSubmit,
    register,
    getValues,
    setError,
    reset,
    formState: { errors },
  } = useForm<SignUpForm>({
    mode: "onSubmit",
    defaultValues: {
      phone_number: "",
    },
  });

  const { mutate: createPermission, isLoading } =
    api.permission.create.useMutation({
      onSuccess: async () => {
        setSubmitted(true);
      },
      onError: (e) => {
        if (e.data && e.data.httpStatus === 409) {
          setError("phone_number", {
            type: "conflict",
            message: "Ce numéro existe déjà dans la base de donnée",
          });
        }
      },
    });

  const onSubmit: SubmitHandler<SignUpForm> = (data) => {
    createPermission({ phone_number: data.phone_number });
  };

  if (submitted) {
    return (
      <SupervisorFormWrapper>
        <Text>
          Le numéro <Text as="b">{getValues("phone_number")}</Text> a bien été
          ajouté, le jeune peut désormais se connecter à l'application et
          configurer son compte.
        </Text>
        <Button
          mt={6}
          colorScheme="cje-gray"
          color="black"
          fontWeight="bold"
          variant="solid"
          onClick={() => {
            setSubmitted(false);
            reset();
          }}
        >
          Entrer un autre numéro
        </Button>
      </SupervisorFormWrapper>
    );
  }

  return (
    <SupervisorFormWrapper>
      <Text fontSize="sm" fontWeight="medium" color="secondaryText">
        Saisissez le numéro de téléphone du jeune sous la forme +33X ou 0X
      </Text>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box my={6}>
          <FormInput
            field={{
              label: "Numéro",
              kind: "tel",
              name: "phone_number",
              rules: {
                required: "Ce champ est obligatoire",
                pattern: {
                  value: frenchPhoneNumber,
                  message: "Numéro de téléphone invalide",
                },
              },
            }}
            register={register}
            fieldError={errors["phone_number"]}
          />
        </Box>
        <Button
          colorScheme="blackBtn"
          type={"submit"}
          float="right"
          isLoading={isLoading}
          rightIcon={<Icon as={HiArrowRight} w={6} h={6} />}
        >
          Valider
        </Button>
      </form>
    </SupervisorFormWrapper>
  );
}
