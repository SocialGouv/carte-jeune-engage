import { Box, Button, Flex, Heading } from "@chakra-ui/react";
import { ReactNode } from "react";
import { PassIcon } from "../icons/pass";
import { useRouter } from "next/router";

type WalletWrapperProps = {
  children: ReactNode;
};

const WalletWrapper = ({ children }: WalletWrapperProps) => {
  const router = useRouter();

  return (
    <Flex flexDir="column" pt={14} h="full" bgColor="bgGray">
      <Button
        colorScheme="whiteBtn"
        color="black"
        alignSelf="start"
        leftIcon={<PassIcon w={6} h={6} />}
        ml={8}
        mb={4}
        py={5}
        px={3}
        fontWeight={500}
        borderRadius="2.5xl"
        size="xs"
        onClick={() => router.push("/dashboard/account")}
      >
        Ma carte
      </Button>
      <Flex
        flexDir="column"
        h="full"
        bgColor="white"
        borderTopRadius="2.5xl"
        pt={5}
      >
        <Heading as="h2" fontWeight={800} px={8}>
          Mes Réductions
        </Heading>
        <Box flex={1} mt={8} pb={28}>
          {children}
        </Box>
      </Flex>
    </Flex>
  );
};

export default WalletWrapper;
