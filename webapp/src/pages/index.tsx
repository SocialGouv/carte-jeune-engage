import { api } from "~/utils/api";
import { Box, Button, Flex, Heading, Icon } from "@chakra-ui/react";
import { useForm, type SubmitHandler } from "react-hook-form";
import FormInput from "~/components/FormInput";
import { HiOutlineArrowLeft, HiOutlineArrowRight } from "react-icons/hi";
import { useRouter } from "next/router";
import { setCookie } from "cookies-next";

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

  const { mutate: loginUser, isLoading } = api.user.login.useMutation({
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
    await loginUser(values);
  };

  return (
    <Flex
      display="flex"
      flexDir="column"
      py={12}
      px={6}
      justifyContent="space-between"
      h="full"
    >
      <Box>
        <Heading>Connexion</Heading>
        <Flex
          as="form"
          flexDir="column"
          mt={12}
          borderRadius={8}
          gap={6}
          onSubmit={handleSubmit(handleLogin)}
        >
          <FormInput
            name="email"
            label="Email"
            kind="email"
            fieldError={errors.email}
            register={register}
            rules={{ required: "Ce champ est obligatoire" }}
          />
          <FormInput
            name="password"
            label="Mot de passe"
            kind="password"
            fieldError={errors.password}
            register={register}
            rules={{ required: "Ce champ est obligatoire" }}
          />
        </Flex>
      </Box>
      <Flex justifyContent="end">
        <Button
          rightIcon={<Icon as={HiOutlineArrowRight} />}
          onClick={handleSubmit(handleLogin)}
          isLoading={isLoading}
        >
          Se connecter
        </Button>
      </Flex>
    </Flex>
  );
}