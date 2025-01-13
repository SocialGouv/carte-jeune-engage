import {
  Center,
  Flex,
  Icon,
  ListItem,
  Text,
  UnorderedList,
} from "@chakra-ui/react";
import { HiMiniExclamationTriangle } from "react-icons/hi2";

export default function BannerEndApp() {
  return <></>;
  // BANNER
  return (
    <Center
      textAlign="center"
      flexDir="column"
      py={4}
      px={6}
      bgColor="error"
      color="white"
    >
      <Icon as={HiMiniExclamationTriangle} w={8} h={8} />
      <Text fontSize={18} fontWeight={800} lineHeight="normal" mt={2}>
        15 janvier 2025
        <br />
        Fin de la carte “jeune engagé”
      </Text>
      <UnorderedList
        mt={4}
        fontWeight={500}
        fontSize={18}
        textAlign="start"
        spacing={2}
      >
        <ListItem>Téléchargez vos bons d’achat</ListItem>
        <ListItem>Derniers jours pour utiliser les codes de réduction</ListItem>
      </UnorderedList>
    </Center>
  );
}
