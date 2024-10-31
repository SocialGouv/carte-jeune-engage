import {
  Box,
  Center,
  CircularProgress,
  CircularProgressLabel,
  Divider,
  Flex,
  Icon,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { useMemo } from "react";
import { HiShieldCheck, HiUserPlus } from "react-icons/hi2";
import { useAuth } from "~/providers/Auth";
import NewPassComponent from "../NewPassComponent";
import Image from "next/image";
import LoadingLoader from "../LoadingLoader";
import { push } from "@socialgouv/matomo-next";
import { OfferIncluded } from "~/server/api/routers/offer";
import _ from "lodash";

type PropsPassCard = {
  offer?: OfferIncluded;
  embed?: boolean;
};

const PassCard = ({ offer, embed = false }: PropsPassCard) => {
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
      <Flex flexDir="column">
        {!embed && passCJEStatus && (
          <Flex flexDir="column" borderRadius="2.5xl" bgColor="white" p={6}>
            <Flex alignItems="center" gap={1}>
              <Box
                w={1.5}
                h={1.5}
                bgColor={passCJEStatus == "pending" ? "primary" : "error"}
                borderRadius="full"
              />
              <Text
                fontWeight={800}
                color={passCJEStatus == "pending" ? "primary" : "error"}
                fontSize={14}
              >
                {passCJEStatus === "pending"
                  ? "Vérification en cours"
                  : "Photo manquante"}
              </Text>
            </Flex>
            <Text fontWeight={500} mt={1}>
              {passCJEStatus === "pending"
                ? "Nous avons bien reçu votre photo, notre équipe s’assure qu’elle correspond aux critères."
                : "Pour certaines réductions en magasin, une photo est obligatoire"}
            </Text>
            {passCJEStatus === "pending" ? (
              <Text fontWeight={500} mt={4}>
                Votre carte sera valable dès que votre photo est validée !
              </Text>
            ) : (
              <Flex alignItems="center" mt={4}>
                <Text
                  textDecoration="underline"
                  fontWeight={800}
                  onClick={onOpenNewPassComponent}
                >
                  Ajouter ma photo
                </Text>
              </Flex>
            )}
          </Flex>
        )}
        <Flex
          flexDir="column"
          alignItems="center"
          bgColor="white"
          borderRadius="2.5xl"
          pt={10}
          mt={!embed && passCJEStatus ? 4 : 0}
          shadow={!embed ? "default" : "none"}
          style={{ zoom: embed ? 0.25 : 1 }}
        >
          <Box borderRadius="full" overflow="hidden">
            {user.image && !passCJEStatus ? (
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
              <Center
                w={passCJEStatus === "pending" ? 84 : 111}
                h={passCJEStatus === "pending" ? 84 : 111}
                bgColor="cje-gray.500"
                borderRadius="full"
                justifyContent="center"
                alignItems="center"
                style={{
                  backgroundImage:
                    passCJEStatus === "missing"
                      ? `url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='100' ry='100' stroke='%23000000FF' stroke-width='3' stroke-dasharray='8.25%25' stroke-dashoffset='100' stroke-linecap='butt'/%3e%3c/svg%3e")`
                      : "",
                }}
                onClick={
                  passCJEStatus === "missing"
                    ? onOpenNewPassComponent
                    : undefined
                }
              >
                {passCJEStatus === "missing" && (
                  <Box borderRadius="2.5xl" bgColor="blackLight" p={3}>
                    <Icon as={HiUserPlus} w={6} h={6} mb={-1} color="white" />
                  </Box>
                )}
                {passCJEStatus === "pending" && (
                  <CircularProgress
                    value={30}
                    thickness={8}
                    size="52px"
                    color="primary"
                    trackColor="cje-gray.300"
                  >
                    <CircularProgressLabel>
                      <Icon
                        as={HiShieldCheck}
                        w={6}
                        h={6}
                        mb={-1}
                        color="blackLight"
                      />
                    </CircularProgressLabel>
                  </CircularProgress>
                )}
              </Center>
            )}
          </Box>
          <Text fontSize="2xl" fontWeight="extrabold" textAlign="center" mt={4}>
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
            <Box bgColor="primary" px={9} pt={6} pb={3} borderTopRadius="full">
              <Image
                src="/images/cje-logo-white-blue.svg"
                alt="Logo CJE"
                width={60}
                height={32}
              />
            </Box>
          </Flex>
        </Flex>
      </Flex>
      <NewPassComponent
        isOpen={isOpenNewPassComponent}
        onClose={onCloseNewPassComponent}
      />
    </>
  );
};

export default PassCard;
