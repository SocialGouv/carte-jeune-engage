import { Box, Button, Flex, Heading, Icon, Link } from "@chakra-ui/react";
import { ReactNode, useState } from "react";
import { HiCog6Tooth, HiQuestionMarkCircle, HiUser } from "react-icons/hi2";
import NextLink from "next/link";
import dynamic from "next/dynamic";
import { useAuth } from "~/providers/Auth";

const CRISP_TOKEN = process.env.NEXT_PUBLIC_CRISP_TOKEN as string;

type WalletWrapperProps = {
  children: ReactNode;
};

const WalletWrapper = ({ children }: WalletWrapperProps) => {
  const { user } = useAuth();

  const [isOpenCrisp, setIsOpenCrisp] = useState(false);

  const CrispWithNoSSR = dynamic(() => import("../support/Crisp"));

  return (
    <Flex flexDir="column" pt={14} h="full" bgColor="bgGray">
      <Flex alignItems="center" mx={8} mb={4} gap={3}>
        <Link as={NextLink} href="/dashboard/account/information" passHref>
          <Button
            colorScheme="whiteBtn"
            color="black"
            leftIcon={<Icon as={HiUser} w={6} h={6} />}
            iconSpacing={0}
            py={5}
            px={3}
            fontWeight={500}
            borderRadius="2.5xl"
            size="xs"
          />
        </Link>
        <Link as={NextLink} href="/dashboard/account/settings" passHref>
          <Button
            colorScheme="whiteBtn"
            color="black"
            leftIcon={<Icon as={HiCog6Tooth} w={6} h={6} />}
            iconSpacing={0}
            py={5}
            px={3}
            fontWeight={500}
            borderRadius="2.5xl"
            size="xs"
          />
        </Link>
        <Icon
          as={HiQuestionMarkCircle}
          w={6}
          h={6}
          ml="auto"
          onClick={() => setIsOpenCrisp(true)}
        />
      </Flex>
      <Flex
        flexDir="column"
        h="full"
        bgColor="white"
        borderTopRadius="2.5xl"
        pt={5}
      >
        <Heading as="h2" fontWeight={800} px={8}>
          Mes Réductions
        </Heading>
        <Box flex={1} mt={8} pb={28}>
          {children}
        </Box>
      </Flex>
      {isOpenCrisp && user && (
        <CrispWithNoSSR
          crispToken={CRISP_TOKEN}
          user={user}
          onClose={() => {
            setIsOpenCrisp(false);
          }}
        />
      )}
    </Flex>
  );
};

export default WalletWrapper;
