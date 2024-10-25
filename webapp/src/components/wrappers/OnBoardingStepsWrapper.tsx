import { Box, Flex, Icon, IconButton } from "@chakra-ui/react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/router";
import { ReactNode } from "react";
import { HiChevronLeft } from "react-icons/hi2";

type OnBoardingStepsWrapperProps = {
  children: ReactNode;
  stepContext: { isFirstStep?: boolean; current: number; total: number };
  onBack?: () => void;
};

const OnBoardingStepsWrapper = ({
  children,
  stepContext: { isFirstStep, current, total },
  onBack,
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
        <IconButton
          icon={<Icon as={HiChevronLeft} w={5} h={5} />}
          aria-label="Retour"
          variant="unstyled"
          h={5}
          minW="fit-content"
          isDisabled={!(current > 1 && !isFirstStep)}
          onClick={() => (onBack ? onBack() : router.back())}
          cursor="pointer"
          position="absolute"
          left={4}
        />
        <Image
          src="/images/cje-logo.png"
          alt="CJE Logo"
          width={52}
          height={0}
          style={{
            position: "absolute",
            left: 50,
          }}
        />
        <Box bgColor="cje-gray.300" borderRadius="xl" w="30%" h="6px">
          <Box
            as={motion.div}
            layout
            h="6px"
            w={`${(current / total) * 100}%`}
            borderRadius="xl"
            bgColor="primary"
          />
        </Box>
      </Flex>
      {children}
    </Flex>
  );
};

export default OnBoardingStepsWrapper;
