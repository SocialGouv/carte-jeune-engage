import { Box, Button, Flex, Heading, Icon } from "@chakra-ui/react";
import { setCookie } from "cookies-next";
import { useRouter } from "next/router";
import { useForm, type SubmitHandler } from "react-hook-form";
import { HiOutlineArrowRight } from "react-icons/hi";
import FormInput from "~/components/FormInput";
import { api } from "~/utils/api";

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

  const { mutate: loginUser, isLoading } = api.user.loginSupervisor.useMutation(
    {
      onSuccess: async ({ data }) => {
        setCookie(
          process.env.NEXT_PUBLIC_JWT_NAME ?? "cje-jwt",
          data.token || ""
        );
        router.push("/");
      },
    }
  );

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
      <form onSubmit={handleSubmit(handleLogin)}>
        <Box>
          <Heading>Connexion référents</Heading>
          <Flex flexDir="column" mt={12} borderRadius={8} gap={6}>
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
        <Flex justifyContent="end" mt={6}>
          <Button
            rightIcon={<Icon as={HiOutlineArrowRight} />}
            type="submit"
            isLoading={isLoading}
          >
            Se connecter
          </Button>
        </Flex>
      </form>
    </Flex>
  );
}