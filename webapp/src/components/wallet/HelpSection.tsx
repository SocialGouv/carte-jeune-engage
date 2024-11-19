import { Flex, Icon, Text } from "@chakra-ui/react";
import { ReactNode } from "react";
import { HiMiniTag } from "react-icons/hi2";

type HelpSectionProps = {
  title: string;
  icon: ReactNode;
  iconName: string;
  description: string;
};

const HelpSection = ({
  title,
  icon,
  iconName,
  description,
}: HelpSectionProps) => {
  return (
    <Flex flexDir="column">
      <Text fontWeight={700}>{title}</Text>
      <Flex
        alignItems="center"
        mt={2}
        bgColor="bgGray"
        borderRadius="full"
        alignSelf="start"
        py={1}
        px={2}
        gap={1}
        fontWeight={500}
      >
        {icon}
        {iconName}
      </Flex>
      <Text fontWeight={500} mt={3}>
        {description}
      </Text>
    </Flex>
  );
};

export default HelpSection;
