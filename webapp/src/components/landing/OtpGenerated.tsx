import {
  Box,
  Divider,
  Flex,
  Heading,
  HStack,
  Icon,
  Input,
  Link,
  Text,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import {
  HiEnvelope,
  HiMiniChatBubbleLeft,
  HiMiniLockClosed,
} from "react-icons/hi2";
import OtpInput from "react-otp-input";
import { api } from "~/utils/api";
import { addSpaceToTwoCharacters } from "~/utils/tools";
import NextLink from "next/link";

const defaultTimeToResend = 30;

type OtpGeneratedProps = {
  currentPhoneNumber: string;
  kind: "otp" | "email";
  otp: string;
  setOtp: (value: string) => void;
  hasOtpError: boolean;
  setHasOtpError: (value: boolean) => void;
  hasOtpExpired: boolean;
  setHasOtpExpired: (value: boolean) => void;
  handleGenerateOtp: (data: { phone_number: string }) => void;
  handleLoginUser: (otp: string) => void;
};

const OtpGenerated = (props: OtpGeneratedProps) => {
  const {
    currentPhoneNumber,
    kind,
    otp,
    setOtp,
    hasOtpError,
    setHasOtpError,
    hasOtpExpired,
    setHasOtpExpired,
    handleGenerateOtp,
    handleLoginUser,
  } = props;

  const [timeToResend, setTimeToResend] = useState(defaultTimeToResend);
  const [showHelpPage, setShowHelpPage] = useState(false);

  const { data: resultSecretEmail } =
    api.user.getSecretEmailFromPhoneNumber.useQuery(
      {
        phone_number: currentPhoneNumber,
      },
      { enabled: kind === "email" }
    );

  const secretEmail = resultSecretEmail?.data.email;

  const handleResendOtp = () => {
    handleGenerateOtp({ phone_number: currentPhoneNumber });
    setTimeToResend(defaultTimeToResend);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (timeToResend > 0) setTimeToResend(timeToResend - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timeToResend]);

  if (showHelpPage) {
    return (
      <Flex flexDir="column">
        <Box alignSelf="center" borderRadius="2.5xl" position="relative">
          <Icon as={HiMiniLockClosed} color="disabled" w={8} h={8} mb={-1.5} />
        </Box>
        <Heading
          mt={6}
          fontSize="2xl"
          fontWeight="extrabold"
          textAlign="center"
        >
          Vous n’arrivez pas à vous connecter à votre compte ?
        </Heading>
        <Text
          mt={4}
          fontSize={14}
          fontWeight={500}
          color="secondaryText"
          textAlign="center"
        >
          Pour obtenir de l’aide si vous avez changé votre n° de téléphone ou
          votre adresse email. Contactez-nous à l’adresse ci-dessous.
        </Text>
        <Link
          as={NextLink}
          href="mailto:cje@fabrique.social.gouv.fr"
          fontSize={24}
          fontWeight={800}
          color="primary"
          mt={6}
          textDecor="underline"
          textUnderlineOffset={2}
          textDecorationThickness="3px"
          passHref
        >
          cje@fabrique.social.gouv.fr
        </Link>
      </Flex>
    );
  }

  return (
    <>
      <Flex flexDir="column">
        <Box alignSelf="center" borderRadius="2.5xl" position="relative" mb={6}>
          <Icon
            as={kind === "otp" ? HiMiniChatBubbleLeft : HiEnvelope}
            color="primary"
            w={8}
            h={8}
            mb={-1.5}
          />
          {kind === "email" && (
            <Box
              position="absolute"
              top={0.5}
              right={-0.5}
              bgColor="white"
              borderRadius="full"
              p={0.5}
            >
              <Box bgColor="error" borderRadius="full" w={1.5} h={1.5} />
            </Box>
          )}
        </Box>
        <Heading
          fontSize="2xl"
          fontWeight="extrabold"
          textAlign="center"
          mb={6}
        >
          Vous avez reçu un code par {kind === "otp" ? "SMS" : "mail"}
        </Heading>
        <Text
          fontSize="sm"
          fontWeight="medium"
          color="secondaryText"
          textAlign={kind == "email" ? "center" : "start"}
        >
          {kind === "otp" ? (
            <>
              Saisissez le code envoyé au{" "}
              {addSpaceToTwoCharacters(currentPhoneNumber)} pour pouvoir créer
              votre compte
            </>
          ) : (
            <>
              On vous a envoyé un mail à cette adresse :
              <br />
              {secretEmail}
            </>
          )}
        </Text>
        <Box my={8}>
          <HStack justifyContent="center">
            <OtpInput
              shouldAutoFocus
              value={otp}
              onChange={(otp) => {
                setOtp(otp);
                setHasOtpError(false);
                setHasOtpExpired(false);
                if (otp.length === 4) handleLoginUser(otp);
              }}
              inputType="number"
              numInputs={4}
              placeholder={"----"}
              renderInput={({ style, ...props }) => (
                <Input
                  {...props}
                  _focus={{
                    _placeholder: {
                      color: "transparent",
                    },
                    borderColor: "primary",
                    borderWidth: "2px",
                  }}
                  size="lg"
                  bg={hasOtpError ? "errorLight" : "cje-gray.500"}
                  textAlign="center"
                  borderRadius="2.5xl"
                  borderColor="transparent"
                  _hover={{ borderColor: "transparent" }}
                  _focusVisible={{ boxShadow: "none" }}
                  w={12}
                  h={18}
                  px={0}
                  mx={1}
                />
              )}
            />
          </HStack>
          {hasOtpExpired && (
            <Text color="error" fontSize={"sm"} mt={2}>
              Le code n'est plus valide, cliquez sur le lien ci-dessous pour
              recevoir un nouveau {kind === "otp" ? "SMS" : "mail"}
            </Text>
          )}
          {hasOtpError && (
            <Text color="error" fontSize={"sm"} mt={2}>
              On dirait que ce code n’est pas le bon
            </Text>
          )}
        </Box>
        <Text
          mt={6}
          textDecor="underline"
          fontWeight="medium"
          color={timeToResend <= 0 ? "blackLight" : "gray.500"}
          onClick={() => {
            if (timeToResend <= 0) handleResendOtp();
          }}
        >
          Me renvoyer un code par {kind === "otp" ? "SMS" : "mail"}{" "}
          {timeToResend <= 0 ? "" : `(${timeToResend}s)`}
        </Text>
        {kind === "email" && (
          <>
            <Divider my={6} />
            <Text color="disabled" fontSize={14} fontStyle="italic">
              Pensez à vérifier vos indésirables et spams si vous ne trouvez pas
              le mail
            </Text>
            <Text
              color="disabled"
              fontWeight={700}
              textDecoration="underline"
              textDecorationThickness="2px"
              textUnderlineOffset={2}
              mt={2}
              onClick={() => setShowHelpPage(true)}
            >
              Vous ne recevez pas du tout de mail ?
            </Text>
          </>
        )}
      </Flex>
    </>
  );
};

export default OtpGenerated;
