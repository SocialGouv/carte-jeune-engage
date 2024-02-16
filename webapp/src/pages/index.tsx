import { api } from "~/utils/api";
import { Box, Button, Flex, Heading, Icon } from "@chakra-ui/react";
import { useForm, type SubmitHandler } from "react-hook-form";
import FormInput from "~/components/forms/FormInput";
import { HiOutlineArrowRight } from "react-icons/hi";
import { useRouter } from "next/router";
import { setCookie } from "cookies-next";
import { HiArrowRight } from "react-icons/hi2";

type LoginForm = {
  email: string;
  password: string;
};

export default function Home() {
  const router = useRouter();

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<LoginForm>();

  const { mutate: loginUser, isLoading } = api.user.loginUser.useMutation({
    onSuccess: async ({ data }) => {
      setCookie(
        process.env.NEXT_PUBLIC_JWT_NAME ?? "cje-jwt",
        data.token || ""
      );
      router.reload();
      router.push("/dashboard");
    },
  });

  const handleLogin: SubmitHandler<LoginForm> = async (values) => {
    console.log(values);
  };

  return (
    <Flex flexDir="column" py={12} h="full">
      <Heading
        textAlign={"center"}
        mt={8}
        mb={12}
        fontSize={"xl"}
        fontWeight={"bold"}
      >
        Ma carte
        <br />
        jeune engagé
      </Heading>
      <Flex
        flexDir={"column"}
        borderTopWidth={1}
        borderTopColor={"cje-gray.300"}
        borderTopRadius={"3xl"}
        px={8}
        py={12}
      >
        <Heading fontSize={"2xl"} fontWeight={"bold"} mb={6}>
          Connectez-vous avec votre n° de téléphone
        </Heading>
        <form onSubmit={handleSubmit(handleLogin)}>
          <FormInput
            field={{
              name: "phone",
              kind: "tel",
              rules: { required: "Ce champ est obligatoire" },
              placeholder: "Votre numéro de téléphone",
              prefix: "🇫🇷",
            }}
            fieldError={errors.email}
            register={register}
          />
          <Button
            mt={4}
            colorScheme="blackBtn"
            type={"submit"}
            float="right"
            w="full"
            isLoading={isLoading}
            rightIcon={<Icon as={HiArrowRight} w={6} h={6} />}
          >
            Accéder aux réductions
          </Button>
        </form>
      </Flex>
    </Flex>
  );
}
