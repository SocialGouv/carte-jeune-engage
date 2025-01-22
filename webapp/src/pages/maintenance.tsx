import { Center, Flex, Icon, Text } from "@chakra-ui/react";
import Image from "next/image";
import { HiOutlineInformationCircle } from "react-icons/hi2";

export default function HomeMaintenance() {
  return (
    <Center flexDir="column" maxW={{ base: "sm", md: "lg" }} mx="auto" mt={16}>
      <Image
        src="/images/cje-logo-blue.svg"
        alt="Logo de l'application Carte Jeune Engagé"
        style={{ filter: "saturate(0)" }}
        width={150}
        height={20}
      />
      <Text
        fontWeight={800}
        fontSize={{ base: 16, md: 20 }}
        color="disabled"
        px={{ base: 0, md: 4 }}
        mt={6}
        textAlign="center"
      >
        Le service carte “Jeune Engagé" est définitivement fermé
      </Text>
      <Flex gap={2.5} mt={8}>
        <Icon as={HiOutlineInformationCircle} color="disabled" w={5} h={5} />
        <Text color="disabled" fontWeight={500} fontSize={{ base: 12, md: 14 }}>
          Avis aux usagers ayant acheté des bons d'achat : vos bons d'achat sont
          toujours utilisables, et ce jusqu'à leur date d'expiration qui figure
          sur le ficher .pdf
        </Text>
      </Flex>
    </Center>
  );
}
