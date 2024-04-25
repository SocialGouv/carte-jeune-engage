import {
  Box,
  Button,
  Center,
  Divider,
  Flex,
  Heading,
  Icon,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useAuth } from "~/providers/Auth";
import LoadingLoader from "~/components/LoadingLoader";
import Image from "next/image";
import { ChevronLeftIcon } from "@chakra-ui/icons";
import { useMemo } from "react";
import { HiCheckBadge, HiShieldCheck } from "react-icons/hi2";
import NewPassComponent from "~/components/NewPassComponent";

export default function AccountCard() {
  const router = useRouter();
  const { user } = useAuth();

  const {
    isOpen: isOpenNewPassComponent,
    onOpen: onOpenNewPassComponent,
    onClose: onCloseNewPassComponent,
  } = useDisclosure();

  const passCJEStatus = useMemo(() => {
    return user?.status_image === "pending" && user.image
      ? "pending"
      : !user?.image
      ? "missing"
      : undefined;
  }, [user]);

  if (!user)
    return (
      <Center h="full" w="full">
        <LoadingLoader />
      </Center>
    );

  return (
    <Box pt={12} pb={36} px={8}>
      <Flex position="relative" justifyContent="center">
        <Button
          colorScheme="whiteBtn"
          onClick={() => router.back()}
          pos="absolute"
          left={0}
          size="md"
          width={8}
          iconSpacing={0}
          px={0}
          rightIcon={<ChevronLeftIcon w={6} h={6} color="black" />}
        />
        <Heading
          as="h2"
          size="lg"
          fontWeight="extrabold"
          textAlign="center"
          my={1}
        >
          Ma carte CJE
        </Heading>
      </Flex>
      {passCJEStatus && (
        <Center
          display="flex"
          flexDir="column"
          textAlign="center"
          border="1px solid"
          borderRadius="1.5xl"
          borderColor="borderGray"
          mt={6}
          p={6}
        >
          <Flex alignItems="center" gap={2}>
            <Icon
              as={passCJEStatus === "pending" ? HiShieldCheck : HiCheckBadge}
              w={6}
              h={6}
              color="primary.500"
            />
            <Text fontWeight="bold" color="primary.500">
              {passCJEStatus === "pending"
                ? "Photo en cours de vérification"
                : "Validez votre carte CJE"}
            </Text>
          </Flex>
          <Text fontWeight="medium" mt={2}>
            {passCJEStatus === "pending"
              ? "Nous avons bien reçu votre photo, si votre visage est correctement visible, en 24h c’est bon !"
              : "Il manque votre photo pour valider votre carte"}
          </Text>
          {passCJEStatus === "missing" && (
            <Button mt={3} size="lg" w="full" onClick={onOpenNewPassComponent}>
              <Box lineHeight="short">
                Ajouter ma photo
                <Text opacity="70%" fontSize="xs">
                  obligatoire
                </Text>
              </Box>
            </Button>
          )}
        </Center>
      )}
      <Flex
        flexDir="column"
        alignItems="center"
        bgColor="white"
        borderRadius="1.5xl"
        pt={12}
        pb={6}
        mt={passCJEStatus ? 6 : 10}
        gap={8}
      >
        <Box borderRadius="full" overflow="hidden">
          {user.status_image === "approved" && user.image ? (
            <Image
              src={user.image.url as string}
              alt={user.image.alt as string}
              width={111}
              height={111}
              objectFit="cover"
              objectPosition="center"
              style={{ width: "111px", height: "111px" }}
            />
          ) : (
            <Box
              w={111}
              h={111}
              bgColor="cje-gray.500"
              borderRadius="full"
              justifyContent="center"
              alignItems="center"
            />
          )}
        </Box>
        <Flex flexDir="column" gap={4}>
          <Flex flexDir="column" alignItems="center">
            <Text fontWeight="medium" fontSize="xs" color="disabled">
              Nom
            </Text>
            <Text fontSize="2xl" fontWeight="extrabold">
              {user.firstName} {user.lastName}
            </Text>
          </Flex>
          <Flex flexDir="column" alignItems="center">
            <Text fontWeight="medium" fontSize="xs" color="disabled">
              ID
            </Text>
            <Text fontSize="xl" fontWeight="extrabold">
              {user.id}
            </Text>
          </Flex>
        </Flex>
        <Flex flexDir="column" alignItems="center" gap={3}>
          <Image
            src="/images/government-banner.png"
            alt="Bandeau du gouvernement français"
            width={82}
            height={49}
          />
          <Text
            fontSize="xs"
            fontWeight="medium"
            color="disabled"
            textAlign="center"
          >
            Carte membre beta testeur 2024
            <br />
            Projet carte "jeunes engagés"
          </Text>
        </Flex>
      </Flex>
      <Divider my={6} borderColor="borderGray" />
      <Text fontSize="sm" fontWeight="bold">
        La carte CJE est utile pour les offres et les réductions en magasin 🛒
        <br />
        Vous pouvez la présenter au commerçant au moment de payer, en caisse.
      </Text>
      <NewPassComponent
        isOpen={isOpenNewPassComponent}
        onClose={onCloseNewPassComponent}
      />
    </Box>
  );
}
