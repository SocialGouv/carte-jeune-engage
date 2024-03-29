import { Box, Flex, Icon } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import { ReactNode } from "react";
import { HiChevronLeft } from "react-icons/hi2";

type OnBoardingStepsWrapperProps = {
  children: ReactNode;
  stepContext: { isFirstStep?: boolean; current: number; total: number };
};

const OnBoardingStepsWrapper = ({
  children,
  stepContext: { isFirstStep, current, total },
}: OnBoardingStepsWrapperProps) => {
  const router = useRouter();

  return (
    <Flex flexDir="column" h="full">
      <Flex
        position="relative"
        alignItems="center"
        justifyContent="center"
        pt={8}
      >
        {current > 1 && !isFirstStep && (
          <Icon
            as={HiChevronLeft}
            w={6}
            h={6}
            onClick={() => router.back()}
            cursor="pointer"
            position="absolute"
            left={6}
          />
        )}
        <Box bgColor="cje-gray.300" borderRadius="xl" w="30%" h="6px">
          <Box
            as={motion.div}
            layout
            h="6px"
            w={`${(current / total) * 100}%`}
            borderRadius="xl"
            bgColor="blackLight"
          />
        </Box>
      </Flex>
      {children}
    </Flex>
  );
};

export default OnBoardingStepsWrapper;
