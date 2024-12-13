import { Box, Flex, Icon, IconButton, Link, Text } from "@chakra-ui/react";
import { useRouter } from "next/router";
import PassCard from "~/components/account/PassCard";
import { HiCog6Tooth, HiUser, HiXMark } from "react-icons/hi2";
import NextLink from "next/link";

const HeaderButton = ({
  icon,
  text,
  link,
  onClick,
}: {
  icon: any;
  text: string;
  link: string;
  onClick?: () => void;
}) => {
  return (
    <Link
      as={NextLink}
      href={link}
      _hover={{ textDecoration: "none" }}
      {...(onClick && { onClick: onClick })}
      passHref
    >
      <Flex flexDir="column" alignItems="center">
        <Box
          bgColor="white"
          borderRadius="2.25xl"
          px={2}
          py={1}
          w="fit-content"
        >
          <Icon as={icon} w={6} h={6} mt={1} color="black" />
        </Box>
        <Text mt={2} fontWeight={800} fontSize="sm" color="white">
          {text}
        </Text>
      </Flex>
    </Link>
  );
};

export default function AccountCard() {
  const router = useRouter();

  return (
    <Box pt={12} pb={24} px={8} bgColor="primary" h="max-content">
      <Flex justifyContent="space-between">
        <IconButton
          variant="unstyled"
          aria-label="Retour"
          onClick={() => router.back()}
          size="md"
          px={0}
          icon={<Icon as={HiXMark} w={8} h={8} color="white" />}
        />
        <Flex alignItems="center" gap={7}>
          <HeaderButton
            icon={HiUser}
            text="Mon profil"
            link="/dashboard/account/information"
          />
          <HeaderButton
            icon={HiCog6Tooth}
            text="Réglages"
            link="/dashboard/account/settings"
          />
          {/* <HeaderButton
            icon={HiQuestionMarkCircle}
            text="Aides"
            link=""
            onClick={() => {
              setIsOpenCrisp(true);
            }}
          /> */}
        </Flex>
      </Flex>
      <Box mt={6}>
        <PassCard />
      </Box>
      <Link
        as={NextLink}
        href="/dashboard/wallet"
        _hover={{ textDecoration: "none" }}
        passHref
      >
        <Text
          mt={28}
          w="fit-content"
          mx="auto"
          color="white"
          fontWeight={800}
          borderBottomWidth={1}
          borderBottomColor="white"
        >
          Retour à mes réductions
        </Text>
      </Link>
    </Box>
  );
}
