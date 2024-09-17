import {
  Box,
  Button,
  Center,
  Divider,
  Flex,
  Icon,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { Link } from "@chakra-ui/next-js";
import { useMemo } from "react";
import { HiCheckBadge, HiShieldCheck } from "react-icons/hi2";
import { useAuth } from "~/providers/Auth";
import NewPassComponent from "../NewPassComponent";
import Image from "next/image";
import LoadingLoader from "../LoadingLoader";
import { push } from "@socialgouv/matomo-next";
import { OfferIncluded } from "~/server/api/routers/offer";
import _ from "lodash";

type PropsPassCard = {
  isPage: boolean;
  offer?: OfferIncluded;
};

const PassCard = ({ isPage, offer }: PropsPassCard) => {
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
    <>
      <Flex flexDir={isPage ? "column" : "column-reverse"}>
        {/* {passCJEStatus && (
          <Center
            display="flex"
            flexDir="column"
            textAlign="center"
            border={isPage ? "1px solid" : "none"}
            borderRadius="1.5xl"
            borderColor="borderGray"
            mt={isPage ? 6 : 8}
            p={isPage ? 6 : 0}
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
              <Button
                mt={3}
                size="lg"
                w="full"
                onClick={onOpenNewPassComponent}
              >
                <Box lineHeight="short">
                  Ajouter ma photo
                  <Text opacity="70%" fontSize="xs">
                    obligatoire
                  </Text>
                </Box>
              </Button>
            )}
          </Center>
        )} */}
        <Link
          href="/dashboard/account/card"
          onClick={() => {
            if (!isPage)
              push([
                "trackEvent",
                "Offre",
                `${offer?.partner.name} - ${offer?.title} - Active - Présenter ma carte CJE`,
              ]);
          }}
          pointerEvents={isPage ? "none" : "auto"}
          tabIndex={isPage ? -1 : 0}
          aria-disabled={!isPage}
          _active={{ textDecoration: "none" }}
          _hover={{ textDecoration: "none" }}
        >
          <Flex
            flexDir="column"
            alignItems="center"
            bgColor="white"
            borderRadius="1.5xl"
            pt={isPage ? 12 : 20}
            mt={passCJEStatus ? 6 : isPage ? 10 : 0}
            shadow="default"
          >
            {/* <Box borderRadius="full" overflow="hidden">
              {user.image ? (
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
            </Box> */}
            <Text fontSize="2xl" fontWeight="extrabold" textAlign="center">
              {_.capitalize(user.firstName as string)}
              <br />
              {_.capitalize(user.lastName as string)}
            </Text>
            <Divider w="90%" mx="auto" mt={12} />
            <Flex
              mt={2.5}
              alignItems="center"
              color="disabled"
              fontWeight={500}
              fontSize={12}
              gap={1}
            >
              {new Date().toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
              <Box w={1} h={1} bgColor="disabled" rounded="full" mt={0.5} />
              {new Date().toLocaleTimeString("fr-FR")}
            </Flex>
            <Flex flexDir="column" alignItems="center" gap={3} mt={2.5}>
              <Image
                src="/images/government-banner.png"
                alt="Bandeau du gouvernement français"
                width={82}
                height={49}
              />
              <Text fontSize={12} fontWeight={500} textAlign="center">
                Carte “jeune engagé” officielle
              </Text>
            </Flex>
            <Flex justifyContent="center" mt={5}>
              <Box bgColor="bgBlue" px={9} pt={6} pb={3} borderTopRadius="full">
                <Image
                  src="/images/cje-logo-white-blue.svg"
                  alt="Logo CJE"
                  width={60}
                  height={32}
                />
              </Box>
            </Flex>
          </Flex>
        </Link>
      </Flex>
      <NewPassComponent
        isOpen={isOpenNewPassComponent}
        onClose={onCloseNewPassComponent}
      />
    </>
  );
};

export default PassCard;
