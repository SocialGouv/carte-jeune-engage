import {
  As,
  Box,
  ChakraProps,
  HStack,
  Icon,
  StackProps,
  Text,
  VStack,
} from "@chakra-ui/react";
import { IconType } from "react-icons/lib";
import ReactIcon from "~/utils/dynamicIcon";
import { PassIcon } from "../icons/pass";
import TextWithLinks from "./TextWithLinks";

export type StackItem = {
  text: string;
  icon?: As | string;
};

type StackItemsProps = {
  items: StackItem[];
  active?: boolean;
  title?: string;
  props?: StackProps;
  propsItem?: ChakraProps;
};

const propsActiveText = {
  py: 2,
  px: 3,
  borderRadius: "full",
  bgColor: "successLight",
} as ChakraProps;

const StackItems = ({
  items,
  title,
  active,
  props,
  propsItem,
}: StackItemsProps) => {
  return (
    <VStack spacing={props?.spacing ?? 6} align="start" {...props}>
      {title && (
        <Text key="title-item" fontSize="sm" fontWeight="bold">
          {title}
        </Text>
      )}
      {items.map(({ text, icon }, index) => (
        <HStack
          key={`${text}-${index}-${icon}`}
          spacing={3}
          w="full"
          {...(active && index === 0 ? propsActiveText : undefined)}
          {...(index !== 0 ? propsItem : undefined)}
        >
          {icon && (
            <>
              {typeof icon === "string" ? (
                <>
                  {icon === "PassIcon" ? (
                    <PassIcon w={6} h={6} color="inherit" />
                  ) : (
                    <Box w={6} h={6}>
                      <ReactIcon icon={icon} size={24} color="inherit" />
                    </Box>
                  )}
                </>
              ) : (
                <Icon as={icon as IconType} w={6} h={6} />
              )}
            </>
          )}
          <TextWithLinks
            key={`${text}-${index}-${icon}`}
            props={{ fontWeight: "medium " }}
            text={text}
          />
        </HStack>
      ))}
    </VStack>
  );
};

export default StackItems;
