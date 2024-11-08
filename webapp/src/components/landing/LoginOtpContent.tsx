import { useState } from "react";
import OtpGenerated from "./OtpGenerated";
import {
  Box,
  Flex,
  Heading,
  Icon,
  ListItem,
  Text,
  UnorderedList,
} from "@chakra-ui/react";
import { api } from "~/utils/api";
import { setCookie } from "cookies-next";
import { useRouter } from "next/router";
import BigLoader from "../BigLoader";
import { SubmitHandler } from "react-hook-form";
import { LoginForm } from "./PhoneNumberCTA";
import { HiEnvelope } from "react-icons/hi2";

type LoginOtpContentProps = {
  otpKind: "otp" | "email";
  currentPhoneNumber: string;
  handleGenerateOtp: SubmitHandler<LoginForm>;
};

const LoginOtpContent = (props: LoginOtpContentProps) => {
  const { currentPhoneNumber, otpKind, handleGenerateOtp } = props;
  const router = useRouter();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [otp, setOtp] = useState("");
  const [hasOtpError, setHasOtpError] = useState(false);
  const [hasOtpExpired, setHasOtpExpired] = useState(false);

  const { data: resultSecretEmail } =
    api.user.getSecretEmailFromPhoneNumber.useQuery({
      phone_number: currentPhoneNumber,
    });
  const secretEmail = resultSecretEmail?.data.email;

  const { mutate: loginUser, isLoading: isLoadingLogin } =
    api.user.loginUser.useMutation({
      onSuccess: async ({ data }) => {
        setCookie(
          process.env.NEXT_PUBLIC_JWT_NAME ?? "cje-jwt",
          data.token || "",
          { expires: new Date((data.exp as number) * 1000), sameSite: "lax" }
        );
        router.reload();
        router.push("/dashboard");
      },
      onError: async ({ data }) => {
        if (data?.httpStatus === 401) {
          setHasOtpError(true);
        } else if (data?.httpStatus === 408) {
          setHasOtpExpired(true);
        }
        setIsLoading(false);
      },
    });

  const handleLoginUser = async (otp: string) => {
    setIsLoading(true);
    loginUser({
      phone_number: currentPhoneNumber,
      otp,
    });
  };

  if (isLoading || isLoadingLogin) return <BigLoader />;

  if (otpKind === "email") {
    return (
      <Flex flexDir="column" alignItems="center">
        <Box borderRadius="2.5xl" bgColor="primary" p={5} position="relative">
          <Icon as={HiEnvelope} color="white" w={7} h={7} mb={-1.5} />
          <Box
            position="absolute"
            top={-1}
            right={-1}
            bgColor="white"
            borderRadius="full"
            p={1.25}
          >
            <Box bgColor="error" borderRadius="full" w={3.5} h={3.5} />
          </Box>
        </Box>
        <Heading size="lg" fontWeight={800} textAlign="center" px={6} mt={10}>
          Tout est dans notre dernier mail
        </Heading>
        <UnorderedList mt={10}>
          <ListItem>
            On vous a envoyé un mail à cette adresse :
            <br />
            <strong>{secretEmail}</strong>
          </ListItem>
          <ListItem mt={6}>Cliquez sur le lien dans le mail</ListItem>
          <ListItem>Et voilà vous serez connecté !</ListItem>
        </UnorderedList>
        <Text color="disabled" fontSize={14} mt={10}>
          Pensez à vérifier vos indésirables et spams si vous ne trouvez pas le
          mail
        </Text>
      </Flex>
    );
  }

  return (
    <OtpGenerated
      currentPhoneNumber={currentPhoneNumber}
      otp={otp}
      setOtp={setOtp}
      hasOtpError={hasOtpError}
      setHasOtpError={setHasOtpError}
      hasOtpExpired={hasOtpExpired}
      setHasOtpExpired={setHasOtpExpired}
      handleGenerateOtp={handleGenerateOtp}
      handleLoginUser={handleLoginUser}
    />
  );
};

export default LoginOtpContent;
