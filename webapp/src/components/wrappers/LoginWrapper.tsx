import { ArrowBackIcon } from "@chakra-ui/icons";
import { Button, Flex, Heading, SimpleGrid } from "@chakra-ui/react";
import Image from "next/image";
import { useRouter } from "next/router";
import { ReactNode } from "react";
import BackButton from "../ui/BackButton";

type LoginWrapperProps = {
  children: ReactNode;
  onBack?: () => void;
};

const LoginWrapper = ({ children, onBack }: LoginWrapperProps) => {
  return (
    <Flex flexDir="column" pt={6} px={8}>
      <Flex alignItems="center" gap={2} ml={-4}>
        <BackButton onClick={onBack} variant="ghost" />
        <Image
          src="/images/cje-logo.png"
          alt="CJE Logo"
          width={52}
          height={0}
        />
      </Flex>
      {children}
    </Flex>
  );
};

export default LoginWrapper;
