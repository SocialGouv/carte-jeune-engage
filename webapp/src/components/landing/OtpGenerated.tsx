import {
  Box,
  Flex,
  Heading,
  HStack,
  Icon,
  Input,
  Text,
} from "@chakra-ui/react";
import { HiChevronLeft } from "react-icons/hi2";
import OtpInput from "react-otp-input";
import { addSpaceToTwoCharacters } from "~/utils/tools";
import { useAuth } from "~/providers/Auth";

type OtpGeneratedProps = {
  setCurrentPhoneNumber: (value: string) => void;
  currentPhoneNumber: string;
  otp: string;
  setOtp: (value: string) => void;
  hasOtpError: boolean;
  setHasOtpError: (value: boolean) => void;
  hasOtpExpired: boolean;
  setHasOtpExpired: (value: boolean) => void;
  timeToResend: number;
  handleGenerateOtp: (data: { phone_number: string }) => void;
  handleLoginUser: (otp: string) => void;
};

const OtpGenerated = (props: OtpGeneratedProps) => {
  const { setIsOtpGenerated } = useAuth();

  const {
    currentPhoneNumber,
    setCurrentPhoneNumber,
    otp,
    setOtp,
    hasOtpError,
    setHasOtpError,
    hasOtpExpired,
    setHasOtpExpired,
    timeToResend,
    handleGenerateOtp,
    handleLoginUser,
  } = props;

  return (
    <>
      <Flex flexDir="column">
        <Heading
          fontSize="2xl"
          fontWeight="extrabold"
          textAlign="center"
          mb={6}
        >
          Vous avez reçu un code par SMS
        </Heading>
        <Text fontSize="sm" fontWeight="medium" color="secondaryText">
          Saisissez le code envoyé au{" "}
          {addSpaceToTwoCharacters(currentPhoneNumber)} pour pouvoir créer votre
          compte
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
              recevoir un nouveau SMS
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
          color={timeToResend <= 0 ? "black" : "gray.500"}
          onClick={() => {
            if (timeToResend <= 0)
              handleGenerateOtp({ phone_number: currentPhoneNumber });
          }}
        >
          Me renvoyer un code par SMS{" "}
          {timeToResend <= 0 ? "" : `(${timeToResend}s)`}
        </Text>
      </Flex>
    </>
  );
};

export default OtpGenerated;
