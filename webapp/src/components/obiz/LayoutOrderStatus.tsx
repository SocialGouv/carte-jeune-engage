import {
  Box,
  Center,
  CircularProgress,
  Flex,
  Icon,
  Text,
} from "@chakra-ui/react";
import { HiCheckCircle, HiXMark } from "react-icons/hi2";
import Image from "../ui/Image";
import { HiExclamationCircle } from "react-icons/hi";
import { useRouter } from "next/router";

export type LayoutOrderStatusProps = {
  status: "loading" | "success" | "error" | "info";
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  onClose?: () => void;
};

const LayoutOrderStatusIcon = ({
  status,
}: {
  status: LayoutOrderStatusProps["status"];
}) => {
  switch (status) {
    case "loading":
      return <CircularProgress color="blackLight" isIndeterminate />;
    case "info":
      return <Icon as={HiCheckCircle} color="primary" fontSize="4xl" />;
    case "success":
      return <Icon as={HiCheckCircle} color="success" w={8} h={8} />;
    case "error":
      return <Icon as={HiExclamationCircle} color="error" w={8} h={8} />;
  }
};

const LayoutOrderStatus = (props: LayoutOrderStatusProps) => {
  const { status, title, subtitle, children, onClose } = props;
  const router = useRouter();

  return (
    <Flex
      alignItems="center"
      flexDir="column"
      py={14}
      px={4}
      minH="full"
      grow={1}
    >
      <Center position="relative" w="full">
        {onClose && (
          <Icon
            as={HiXMark}
            w={8}
            h={8}
            position="absolute"
            left={0}
            top={0}
            onClick={onClose}
            aria-label="Close"
          />
        )}
        <Image
          src="/images/cje-logo.png"
          alt='Logo de carte "jeune engagé"'
          height={32}
          width={60}
        />
      </Center>
      <Box mt={18}>
        <LayoutOrderStatusIcon status={status} />
      </Box>
      <Text
        fontSize={24}
        fontWeight={800}
        color="blackLight"
        mt={14}
        textAlign="center"
        lineHeight="normal"
      >
        {title}
      </Text>
      {subtitle && (
        <Text fontSize="sm" color="blackLight" textAlign="center" mt={4}>
          {subtitle}
        </Text>
      )}
      {children}
    </Flex>
  );
};

export default LayoutOrderStatus;
