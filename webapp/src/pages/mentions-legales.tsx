import { ChevronLeftIcon } from "@chakra-ui/icons";
import { Box, Button, Divider, Heading, Text, VStack } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useAuth } from "~/providers/Auth";

const SubHeading = ({ children }: { children: React.ReactNode }) => (
  <Heading as="h2" size={{ base: "lg", lg: "2xl" }} mt={10} color="black">
    {children}
  </Heading>
);

export default function LegalMentions() {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <VStack
      spacing={8}
      align="left"
      mt={!!user ? 0 : 12}
      py={!!user ? 10 : 0}
      px={{ base: 6, lg: 2 }}
      fontWeight="medium"
      color="secondaryText"
    >
      {!!user && (
        <Button
          colorScheme="whiteBtn"
          onClick={() => {
            router.back();
          }}
          size="md"
          width={8}
          iconSpacing={0}
          px={0}
          rightIcon={<ChevronLeftIcon w={6} h={6} color="black" />}
        />
      )}
      <Heading
        as="h1"
        size={{ base: "xl", lg: "3xl" }}
        fontWeight="extrabold"
        color="black"
      >
        Mentions légales
      </Heading>
      <Divider />
      <Box>
        <SubHeading>Éditeur de la plateforme</SubHeading>
        <Divider mt={3} mb={4} />
        <VStack spacing={4} fontSize={{ base: "md", lg: "2xl" }} align="start">
          <Text>La Fabrique numérique des ministères sociaux, située :</Text>
          <Text>Tour Mirabeau</Text>
          <Text>39-43 quai André-Citroën</Text>
          <Text>75739 Paris Cedex 15</Text>
          <Text>France</Text>
        </VStack>
      </Box>
      <Box>
        <SubHeading>Directrice de la publication</SubHeading>
        <Divider mt={3} mb={4} />
        <VStack spacing={4} fontSize={{ base: "md", lg: "2xl" }} align="start">
          <Text>
            Madame Anne JEANJEAN, Directrice du numérique des ministères sociaux
          </Text>
        </VStack>
      </Box>
      <Box>
        <SubHeading>Hébergement de la plateforme</SubHeading>
        <Divider mt={3} mb={4} />
        <VStack spacing={4} fontSize={{ base: "md", lg: "2xl" }} align="start">
          <Text>OVH SAS</Text>
          <Text>2, rue Kellermann</Text>
          <Text>59100 Roubaix</Text>
          <Text>France</Text>
        </VStack>
      </Box>
    </VStack>
  );
}
