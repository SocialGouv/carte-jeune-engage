import { Box, Button, Divider, Flex, Heading, Text } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { ChevronLeftIcon } from "@chakra-ui/icons";
import PassCard from "~/components/account/PassCard";

export default function AccountCard() {
  const router = useRouter();

  return (
    <Box pt={12} pb={36} px={8}>
      <Flex position="relative" justifyContent="center">
        <Button
          colorScheme="whiteBtn"
          onClick={() => router.back()}
          pos="absolute"
          left={0}
          size="md"
          width={8}
          iconSpacing={0}
          px={0}
          rightIcon={<ChevronLeftIcon w={6} h={6} color="black" />}
        />
        <Heading
          as="h2"
          size="lg"
          fontWeight="extrabold"
          textAlign="center"
          my={1}
        >
          Ma carte CJE
        </Heading>
      </Flex>
      <PassCard isPage={true} />
      <Divider my={6} borderColor="borderGray" />
      <Text fontSize="sm" fontWeight="bold">
        La carte CJE est utile pour les offres et les réductions en magasin 🛒
        <br />
        Vous pouvez la présenter au commerçant au moment de payer, en caisse.
      </Text>
    </Box>
  );
}
