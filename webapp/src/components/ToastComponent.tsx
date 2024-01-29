import { Flex, Icon, Text } from "@chakra-ui/react";
import { IconType } from "react-icons/lib";

export default function ToastComponent({
  text,
  icon,
}: {
  text: string;
  icon: IconType;
}) {
  return (
    <Flex
      alignItems="center"
      justifyContent="space-between"
      bgColor="success"
      color="white"
      px={6}
      py={4}
      borderRadius="xl"
    >
      <Text fontWeight="medium">{text}</Text>
      <Icon as={icon} w={6} h={6} ml={2} aria-label="Fermer le code promo" />
    </Flex>
  );
}
