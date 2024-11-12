import {
  Button,
  Center,
  Divider,
  Flex,
  Heading,
  Icon,
  Text,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useAuth } from "~/providers/Auth";
import LoadingLoader from "~/components/LoadingLoader";
import BackButton from "~/components/ui/BackButton";
import { HiPencil, HiTrash } from "react-icons/hi2";

const userInformations = [
  { label: "Prénom", value: "firstName" },
  { label: "Nom de famille", value: "lastName" },
  { label: "Numéro de téléphone", value: "phone_number" },
  { label: "Adresse email de récupération", value: "userEmail" },
  { label: "Mon adresse", value: "address" },
] as const;

export default function AccountInformation() {
  const router = useRouter();
  const { user } = useAuth();

  if (!user)
    return (
      <Center h="full" w="full">
        <LoadingLoader />
      </Center>
    );

  return (
    <Flex flexDir="column" pt={12} px={8} h="full">
      <BackButton />
      <Heading as="h2" size="xl" fontWeight="extrabold" mt={6}>
        Mes informations <br />
        personnelles
      </Heading>
      <Flex flexDir="column" mt={8}>
        {userInformations.map((userInfo) => (
          <>
            <Flex flexDir="column" gap={1} key={userInfo.label}>
              <Text fontWeight={500} color="disabled" fontSize={14}>
                {userInfo.label}
              </Text>
              <Text fontWeight={800}>{user[userInfo.value] ?? "-"}</Text>
              <Divider my={2} bgColor="disabled" />
            </Flex>
          </>
        ))}
      </Flex>
      <Flex flexDir="column" mt="auto" gap={4} mb={20}>
        <Divider bgColor="disabled" />
        <Flex alignItems="center" gap={2}>
          <Icon as={HiPencil} w={5} h={5} mt="1px" />
          <Text
            fontWeight={800}
            textDecoration="underline"
            textDecorationThickness="2px"
            textUnderlineOffset={2}
          >
            Modifier mes informations
          </Text>
        </Flex>
        <Flex alignItems="center" gap={2} color="disabled" mt={1}>
          <Icon as={HiTrash} w={5} h={5} mt="1px" />
          <Text
            fontWeight={800}
            textDecoration="underline"
            textDecorationThickness="2px"
            textUnderlineOffset={2}
          >
            Supprimer mes informations
          </Text>
        </Flex>
      </Flex>
    </Flex>
  );
}
