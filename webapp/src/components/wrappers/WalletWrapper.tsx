import { Box, Button, Flex, Heading, Icon, Link } from "@chakra-ui/react";
import { ReactNode } from "react";
import { HiCog6Tooth, HiUser } from "react-icons/hi2";
import NextLink from "next/link";
import BannerEndApp from "../BannerEndApp";

type WalletWrapperProps = {
  children: ReactNode;
};

const WalletWrapper = ({ children }: WalletWrapperProps) => {
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
        {/* <Icon
          as={HiQuestionMarkCircle}
          w={6}
          h={6}
          ml="auto"
          onClick={() => setIsOpenCrisp(true)}
        /> */}
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
        <Box mt={6}>
          <BannerEndApp />
        </Box>
        <Box flex={1} mt={8} pb={28}>
          {children}
        </Box>
      </Flex>
    </Flex>
  );
};

export default WalletWrapper;
