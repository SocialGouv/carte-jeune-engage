import { Box, Button, Flex, Heading } from "@chakra-ui/react";
import { ReactNode } from "react";
import { PassIcon } from "../icons/pass";

type WalletWrapperProps = {
  children: ReactNode;
};

const WalletWrapper = ({ children }: WalletWrapperProps) => {
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
      >
        Ma carte
      </Button>
      <Flex
        flexDir="column"
        h="full"
        bgColor="white"
        borderTopRadius="2.5xl"
        pt={5}
        px={8}
      >
        <Heading as="h2" fontWeight={800}>
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
