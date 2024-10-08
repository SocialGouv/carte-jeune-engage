import {
  Box,
  Divider,
  Flex,
  Heading,
  ListItem,
  UnorderedList,
} from "@chakra-ui/react";
import { setCookie } from "cookies-next";
import { useRouter } from "next/router";
import { useState } from "react";
import { ErrorOption, SubmitHandler } from "react-hook-form";
import BigLoader from "~/components/BigLoader";
import OtpGenerated from "~/components/landing/OtpGenerated";
import PhoneNumberCTA, { LoginForm } from "~/components/landing/PhoneNumberCTA";
import LoginWrapper from "~/components/wrappers/LoginWrapper";
import { useAuth } from "~/providers/Auth";
import { api } from "~/utils/api";

const conditionsItems = [
  "Être inscrit dans un Service civique, EPIDE, France travail, Mission locale ou Ecole de la seconde chance",
  "Habiter dans le Val d’Oise (95)",
  "Avoir entre 16 et 25 ans",
  "Ne pas être déjà en emploi",
  "Une personne dans votre Service civique, EPIDE, France travail, Mission locale ou Ecole de la seconde chance vous a inscrit à la carte “jeune engagé” avec votre n° de téléphone",
];

export default function HomeLogin() {
  const router = useRouter();
  const { isOtpGenerated, setIsOtpGenerated } = useAuth();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [phoneNumberError, setPhoneNumberError] = useState<ErrorOption>();
  const [currentPhoneNumber, setCurrentPhoneNumber] = useState<string>("");

  const [otp, setOtp] = useState<string>("");
  const [hasOtpError, setHasOtpError] = useState<boolean>(false);
  const [hasOtpExpired, setHasOtpExpired] = useState<boolean>(false);

  const { mutate: loginUser, isLoading: isLoadingLogin } =
    api.user.loginUser.useMutation({
      onSuccess: async ({ data }) => {
        setCookie(
          process.env.NEXT_PUBLIC_JWT_NAME ?? "cje-jwt",
          data.token || "",
          { expires: new Date((data.exp as number) * 1000) }
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

  const { mutate: generateOtp, isLoading: isLoadingOtp } =
    api.user.generateOTP.useMutation({
      onSuccess: () => {
        setIsOtpGenerated(true);
      },
      onError: async ({ data }) => {
        if (data?.httpStatus === 401) {
        } else {
          setPhoneNumberError({
            type: "internal",
            message: "Erreur coté serveur, veuillez contacter le support",
          });
        }
      },
    });

  const handleGenerateOtp: SubmitHandler<LoginForm> = async (values) => {
    setCurrentPhoneNumber(values.phone_number);
    generateOtp({ phone_number: values.phone_number });
  };

  const handleLoginUser = async (otp: string) => {
    setIsLoading(true);
    loginUser({
      phone_number: currentPhoneNumber,
      otp,
    });
  };

  if (isLoading || isLoadingLogin) return <BigLoader />;

  if (isOtpGenerated)
    return (
      <LoginWrapper>
        <Box mt={8}>
          <OtpGenerated
            currentPhoneNumber={currentPhoneNumber}
            setCurrentPhoneNumber={setCurrentPhoneNumber}
            otp={otp}
            setOtp={setOtp}
            hasOtpError={hasOtpError}
            setHasOtpError={setHasOtpError}
            hasOtpExpired={hasOtpExpired}
            setHasOtpExpired={setHasOtpExpired}
            timeToResend={30}
            handleGenerateOtp={handleGenerateOtp}
            handleLoginUser={handleLoginUser}
          />
        </Box>
      </LoginWrapper>
    );

  return (
    <LoginWrapper>
      <Flex flexDir="column">
        <Heading size="lg" fontWeight={800} textAlign="center" px={6} mt={8}>
          Connectez-vous avec votre n° de téléphone
        </Heading>
        <Box mt={10}>
          <PhoneNumberCTA
            error={phoneNumberError}
            isLoadingOtp={isLoadingOtp}
            onSubmit={handleGenerateOtp}
          />
        </Box>
        <Divider mt={16} />
        <Flex flexDir="column" justifyContent="center" mt={8}>
          <Heading size="sm" fontWeight={800}>
            Quelles sont les conditions pour avoir les réductions carte “jeune
            engagé” ?
          </Heading>
          <UnorderedList mt={4} spacing={1.5}>
            {conditionsItems.map((condition, index) => (
              <ListItem key={index} fontSize={14} fontWeight={500}>
                {condition}
              </ListItem>
            ))}
          </UnorderedList>
        </Flex>
      </Flex>
    </LoginWrapper>
  );
}
