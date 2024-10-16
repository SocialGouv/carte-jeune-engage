import {
  Box,
  Center,
  Divider,
  Flex,
  Heading,
  Icon,
  ListItem,
  Text,
  UnorderedList,
} from "@chakra-ui/react";
import { useState } from "react";
import { ErrorOption, SubmitHandler } from "react-hook-form";
import { HiLockClosed, HiMiniInformationCircle } from "react-icons/hi2";
import LoginOtpContent from "~/components/landing/LoginOtpContent";
import PhoneNumberCTA, { LoginForm } from "~/components/landing/PhoneNumberCTA";
import LoginWrapper from "~/components/wrappers/LoginWrapper";
import { useAuth } from "~/providers/Auth";
import { api } from "~/utils/api";
import { addSpaceToTwoCharacters } from "~/utils/tools";

const conditionsItems = [
  "Être inscrit dans un Service civique, EPIDE, France travail, Mission locale ou Ecole de la seconde chance",
  "Habiter dans le Val d’Oise (95)",
  "Avoir entre 16 et 25 ans",
  "Ne pas être déjà en emploi",
  "Une personne dans votre Service civique, EPIDE, France travail, Mission locale ou Ecole de la seconde chance vous a inscrit à la carte “jeune engagé” avec votre n° de téléphone",
];

export default function HomeLogin() {
  const { isOtpGenerated, setIsOtpGenerated } = useAuth();

  const [otpKind, setOtpKind] = useState<"otp" | "email">();
  const [phoneNumberError, setPhoneNumberError] = useState<ErrorOption>();
  const [currentPhoneNumber, setCurrentPhoneNumber] = useState<string>("");

  const { mutate: generateOtp, isLoading: isLoadingOtp } =
    api.user.generateOTP.useMutation({
      onSuccess: (data) => {
        setIsOtpGenerated(true);
        setOtpKind(data.kind);
      },
      onError: async ({ data }) => {
        if (data?.httpStatus === 401) {
          setPhoneNumberError({
            type: "conflict",
            message:
              "Votre numéro de téléphone n'est pas autorisé à accéder à l'application",
          });
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

  const handleResetPhoneNumber = () => {
    setPhoneNumberError(undefined);
  };

  if (isOtpGenerated && otpKind)
    return (
      <LoginWrapper
        onBack={() => {
          setIsOtpGenerated(false);
          setOtpKind(undefined);
        }}
      >
        <Box mt={otpKind === "otp" ? 8 : 12}>
          <LoginOtpContent
            otpKind={otpKind}
            currentPhoneNumber={currentPhoneNumber}
            handleGenerateOtp={handleGenerateOtp}
          />
        </Box>
      </LoginWrapper>
    );

  return (
    <LoginWrapper>
      <Flex flexDir="column" mt={8}>
        {phoneNumberError && phoneNumberError.type === "conflict" ? (
          <Center flexDir="column" textAlign="center">
            <Icon as={HiLockClosed} w={6} h={6} color="error" />
            <Text fontSize={24} fontWeight={800} mt={8} lineHeight="short">
              Ce numéro n’est pas associé à une carte
            </Text>
            <Text fontWeight={800} mt={10}>
              {addSpaceToTwoCharacters(currentPhoneNumber)}
            </Text>
            <Text
              mt={6}
              cursor="pointer"
              fontWeight={700}
              color="primary"
              textDecoration="underline"
              textDecorationThickness="2px"
              textUnderlineOffset={2}
              onClick={handleResetPhoneNumber}
            >
              Modifier
            </Text>
            <Flex
              mt={10}
              textAlign="start"
              borderRadius="2xl"
              borderWidth={1}
              borderColor="bgGray"
              py={2}
              px={4}
              gap={1.5}
            >
              <Icon
                as={HiMiniInformationCircle}
                w={4}
                h={4}
                mt={0.5}
                color="blackLight"
              />
              <Text fontSize={14} fontWeight={500}>
                Vérifiez qu’une personne de l’EPIDE, Service civique, Mission
                locale ou École de la seconde chance vous a inscrit à la carte
                “jeune engagé” avec ce numéro
              </Text>
            </Flex>
          </Center>
        ) : (
          <>
            <Heading
              size="lg"
              fontWeight={800}
              textAlign="center"
              px={6}
              lineHeight="short"
            >
              Connectez-vous avec votre n° de téléphone
            </Heading>
            <Box mt={10}>
              <PhoneNumberCTA
                onSubmit={handleGenerateOtp}
                error={phoneNumberError}
                isLoadingOtp={isLoadingOtp}
              />
            </Box>
          </>
        )}
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
