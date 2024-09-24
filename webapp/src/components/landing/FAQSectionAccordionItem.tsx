import {
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Icon,
  IconButton,
  Text,
  useBreakpointValue,
} from "@chakra-ui/react";
import {
  HiMiniChevronRight,
  HiMiniMinus,
  HiPlus,
  HiXMark,
} from "react-icons/hi2";

type FAQSectionAccordionItemProps = {
  title: string;
  content: string;
  index: number;
  currentIndex: number | null;
  setCurrentIndex: React.Dispatch<React.SetStateAction<number | null>>;
  total: number;
};

const FAQSectionAccordionItem = ({
  title,
  content,
  index,
  currentIndex,
  setCurrentIndex,
  total,
}: FAQSectionAccordionItemProps) => {
  const accordionBtnSize = useBreakpointValue({
    base: "sm",
    lg: "md",
  });

  return (
    <AccordionItem borderTopWidth={index == 0 ? 0 : 1}>
      {({ isExpanded }) => (
        <Box pb={{ base: isExpanded ? 2 : 0, lg: 8 }}>
          <AccordionButton
            _hover={{
              background: "none",
            }}
            onClick={() => setCurrentIndex(!isExpanded ? index : null)}
            py={4}
            px={0}
          >
            <Text as="span" flex="1" textAlign="left" fontWeight={500} mr={8}>
              {title}
            </Text>
            {isExpanded ? (
              <Icon as={HiMiniMinus} boxSize={6} />
            ) : (
              <Icon as={HiMiniChevronRight} boxSize={6} />
            )}
          </AccordionButton>
          <AccordionPanel px={0}>
            <Text
              textAlign="left"
              fontWeight="medium"
              fontSize={{ base: "md", lg: "xl" }}
            >
              {content}
            </Text>
          </AccordionPanel>
        </Box>
      )}
    </AccordionItem>
  );
};

export default FAQSectionAccordionItem;
