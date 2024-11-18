import { Flex, Icon, Text } from "@chakra-ui/react";
import { HiCheckCircle, HiXCircle } from "react-icons/hi2";
import { getItemsConditionBlocks } from "~/payload/components/CustomSelectBlocksOfUse";
import { Offer } from "~/payload/payload-types";
import { theme } from "~/utils/chakra-theme";
import ReactIcon from "~/utils/dynamicIcon";

const disabledColor = theme.colors["disabled"] as string;

type ConditionBlocksSectionProps = {
  offerConditionBlocksSlugs: string[]; // selected condition blocks slugs
  offerSource: Offer["source"];
};

const ConditionBlocksSection = ({
  offerConditionBlocksSlugs,
  offerSource,
}: ConditionBlocksSectionProps) => {
  return (
    <Flex flexDir="column" gap={4} w="full" px={4}>
      {getItemsConditionBlocks(offerSource).map(({ text, icon, slug }) => {
        const isConditionBlockActive = offerConditionBlocksSlugs.includes(slug);
        return (
          <Flex key={text} alignItems="center" w="full">
            {typeof icon === "string" && (
              <ReactIcon
                icon={icon}
                size={20}
                color={isConditionBlockActive ? "black" : disabledColor}
              />
            )}
            <Text
              fontWeight={500}
              textAlign="start"
              ml={4}
              w="70%"
              color={isConditionBlockActive ? "black" : "disabled"}
              textDecor={isConditionBlockActive ? "none" : "line-through"}
            >
              {text}
            </Text>
            <Icon
              as={isConditionBlockActive ? HiCheckCircle : HiXCircle}
              w={5}
              h={5}
              color={isConditionBlockActive ? "primary" : "error"}
              ml="auto"
            />
          </Flex>
        );
      })}
    </Flex>
  );
};

export default ConditionBlocksSection;
