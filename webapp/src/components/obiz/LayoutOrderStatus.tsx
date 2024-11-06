import { Box, Center, CircularProgress, Flex, Text } from "@chakra-ui/react";
import Image from "../ui/Image";

type LayoutOrderStatusProps = {
  status: "loading" | "success" | "error";
  title: string;
  subtitle?: string;
  footer: React.ReactNode;
};

const LayoutOrderStatusIcon = ({
  status,
}: {
  status: LayoutOrderStatusProps["status"];
}) => {
  switch (status) {
    case "loading":
      return <CircularProgress color="blackLight" isIndeterminate />;
  }
};

const LayoutOrderStatus = (props: LayoutOrderStatusProps) => {
  const { status, title, subtitle, footer } = props;

  return (
    <Center display="flex" flexDir="column" py={14} px={10} minH="full">
      <Image
        src="/images/cje-logo.png"
        alt='Logo de carte "jeune engagé"'
        height={32}
        width={60}
      />
      <Box mt={18}>
        <LayoutOrderStatusIcon status={status} />
      </Box>
      <Text fontSize={24} fontWeight={800} color="blackLight" mt={14}>
        {title}
      </Text>
      {subtitle && (
        <Text fontSize="lg" color="blackLight" textAlign="center">
          {subtitle}
        </Text>
      )}
      {footer}
    </Center>
  );
};

export default LayoutOrderStatus;
