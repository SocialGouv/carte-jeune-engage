import { Flex, Icon, Text } from "@chakra-ui/react";
import { HiCheckCircle, HiXCircle } from "react-icons/hi2";
import { getItemsConditionBlocks } from "~/payload/components/CustomSelectBlocksOfUse";
import { Offer } from "~/payload/payload-types";
import { theme } from "~/utils/chakra-theme";
import ReactIcon from "~/utils/dynamicIcon";

const disabledColor = theme.colors["disabled"] as string;

type ConditionBlocksSectionProps = {
  offerConditionBlocks: {
    text: string;
    icon: string;
    slug: string;
    isCrossed: boolean;
  }[];
  offerSource: Offer["source"];
};

const ConditionBlocksSection = ({
  offerConditionBlocks,
  offerSource,
}: ConditionBlocksSectionProps) => {
  return (
    <Flex flexDir="column" gap={4} w="full" px={4}>
      {offerConditionBlocks.map(({ text, icon, slug, isCrossed }) => {
        return (
          <Flex key={text} alignItems="center" w="full">
            {typeof icon === "string" && slug !== "one-time" ? (
              <ReactIcon
                icon={icon}
                size={20}
                color={!isCrossed ? "black" : disabledColor}
              />
            ) : (
              <Text
                fontSize="xl"
                fontWeight={800}
                color={!isCrossed ? "black" : disabledColor}
                mt={-0.5}
              >
                x1
              </Text>
            )}
            <Text
              fontWeight={500}
              textAlign="start"
              ml={4}
              w="70%"
              color={!isCrossed ? "black" : "disabled"}
              textDecor={!isCrossed ? "none" : "underline"}
              textUnderlineOffset="-0.3em"
              style={{ textDecorationSkipInk: "none" }}
            >
              {text}
            </Text>
            <Icon
              as={!isCrossed ? HiCheckCircle : HiXCircle}
              w={5}
              h={5}
              color={!isCrossed ? "primary" : "error"}
              ml="auto"
            />
          </Flex>
        );
      })}
    </Flex>
  );
};

export default ConditionBlocksSection;
