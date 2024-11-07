import { Box, CircularProgress, Flex, Icon, Text } from "@chakra-ui/react";
import { HiCheckCircle } from "react-icons/hi2";
import Image from "../ui/Image";

type LayoutOrderStatusProps = {
  status: "loading" | "success" | "error" | "info";
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
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
  }
};

const LayoutOrderStatus = (props: LayoutOrderStatusProps) => {
  const { status, title, subtitle, children } = props;

  return (
    <Flex alignItems={"center"} flexDir="column" py={14} px={4} minH="full">
      <Image
        src="/images/cje-logo.png"
        alt='Logo de carte "jeune engagé"'
        height={32}
        width={60}
      />
      <Box mt={18}>
        <LayoutOrderStatusIcon status={status} />
      </Box>
      <Text
        fontSize={24}
        fontWeight={800}
        color="blackLight"
        mt={14}
        textAlign="center"
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
