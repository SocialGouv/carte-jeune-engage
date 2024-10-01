import {
  Accordion,
  Box,
  Center,
  Divider,
  Flex,
  HStack,
  Heading,
  Icon,
  Image,
  Input,
  Link,
  Text,
  chakra,
  shouldForwardProp,
  useBreakpointValue,
  useDisclosure,
} from "@chakra-ui/react";
import { setCookie } from "cookies-next";
import { isValidMotionProp, motion, useAnimation } from "framer-motion";
import { useRouter } from "next/router";
import { useEffect, useMemo, useRef, useState } from "react";
import { type SubmitHandler, ErrorOption } from "react-hook-form";
import {
  HiChevronLeft,
  HiInformationCircle,
  HiMiniChevronRight,
} from "react-icons/hi2";
import BigLoader from "~/components/BigLoader";
import { api } from "~/utils/api";
import { addSpaceToTwoCharacters } from "~/utils/tools";
import FAQSectionAccordionItem from "~/components/landing/FAQSectionAccordionItem";
import BaseModal from "~/components/modals/BaseModal";
import PhoneNumberCTA, {
  ComponentPhoneNumberKeys,
  LoginForm,
} from "~/components/landing/PhoneNumberCTA";
import QRCodeWrapper from "~/components/landing/QRCode";
import NotEligibleForm from "~/components/landing/NotEligibleForm";
import { useAuth } from "~/providers/Auth";
import OtpInput from "react-otp-input";
import EllipsePositionnedImages from "~/components/landing/EllipsePositionnedImages";
import NextLink from "next/link";
import RedirectionSectionBlock from "~/components/landing/RedirectionSectionBlock";

const ChakraBox = chakra(motion.div, {
  shouldForwardProp: (prop) =>
    isValidMotionProp(prop) || shouldForwardProp(prop),
});

const defaultTimeToResend = 30;

const referentItems: { name: string; image: string; link: string }[] = [
  {
    name: "Je suis à France Travail",
    image: "/images/referent/france-travail.png",
    link: "#",
  },
  {
    name: "Je suis à la Mission locale",
    image: "/images/referent/mission-locale.png",
    link: "#",
  },
  {
    name: "Je suis en Service civique",
    image: "/images/referent/service-civique.png",
    link: "#",
  },
  {
    name: "Je suis en école de la 2nde chance",
    image: "/images/referent/e2c.png",
    link: "#",
  },
  { name: "Je suis à l'EPIDE", image: "/images/referent/epide.png", link: "#" },
];

const offersList = [
  {
    title_particle: "un cinéma",
    card_img: "/images/landing/offers/cinema-card.png",
    tag_img: "/images/seeds/tags/culture.png",
    tagRotationAngle: -11,
  },
  {
    title_particle: "les courses",
    card_img: "/images/landing/offers/cinema-card.png",
    tag_img: "/images/seeds/tags/culture.png",
    tagRotationAngle: -11,
  },
  {
    title_particle: "s'habiller",
    card_img: "/images/landing/offers/cinema-card.png",
    tag_img: "/images/seeds/tags/culture.png",
    tagRotationAngle: -11,
  },
  {
    title_particle: "bouger",
    card_img: "/images/landing/offers/cinema-card.png",
    tag_img: "/images/seeds/tags/culture.png",
    tagRotationAngle: -11,
  },
  {
    title_particle: "rester connecté",
    card_img: "/images/landing/offers/cinema-card.png",
    tag_img: "/images/seeds/tags/culture.png",
    tagRotationAngle: -11,
  },
];

export default function Home() {
  const router = useRouter();

  const { isOtpGenerated, setIsOtpGenerated } = useAuth();
  const [otp, setOtp] = useState<string>("");

  const isDesktop = useBreakpointValue({ base: false, lg: true });

  const {
    isOpen: isOpenDesktopLoginSuccessful,
    onOpen: onOpenDesktopLoginSuccessful,
    onClose: onCloseDesktopLoginSuccessful,
  } = useDisclosure({
    onClose: () => setCurrentPhoneNumber(""),
  });

  const {
    isOpen: isOpenDesktopLoginError,
    onOpen: onOpenDesktopLoginError,
    onClose: onCloseDesktopLoginError,
  } = useDisclosure();

  const [hasOtpError, setHasOtpError] = useState(false);
  const [hasOtpExpired, setHasOtpExpired] = useState(false);
  const [forceLoader, setForceLoader] = useState(false);

  const [timeToResend, setTimeToResend] = useState(defaultTimeToResend);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [faqCurrentIndex, setFaqCurrentIndex] = useState<number | null>(null);

  const [currentPhoneNumberKey, setCurrentPhoneNumberKey] =
    useState<ComponentPhoneNumberKeys>("phone-number-cta");
  const [currentPhoneNumber, setCurrentPhoneNumber] = useState<string>("");
  const [phoneNumberError, setPhoneNumberError] = useState<{
    name: ComponentPhoneNumberKeys;
    error: ErrorOption;
  } | null>(null);

  const firstSectionRef = useRef<HTMLDivElement>(null);
  const parentPartnersRef = useRef<HTMLDivElement>(null);

  const resetTimer = () => {
    if (intervalId) clearInterval(intervalId);
    setTimeToResend(defaultTimeToResend);
    const id = setInterval(() => {
      setTimeToResend((prevTime) => prevTime - 1);
    }, 1000);
    setIntervalId(id);
  };

  const { data: resultLogoPartners, isLoading: isLoadingLogoPartners } =
    api.globals.landingPartnersGetLogos.useQuery();

  const logoPartners = resultLogoPartners?.data || [];

  const { data: resultFAQ, isLoading: isLoadingFAQ } =
    api.globals.landingFAQGetAll.useQuery();

  const landingFAQ = resultFAQ?.data || [];

  const { mutate: generateOtp, isLoading: isLoadingOtp } =
    api.user.generateOTP.useMutation({
      onSuccess: () => {
        if (isDesktop) {
          onOpenDesktopLoginSuccessful();
        } else {
          setIsOtpGenerated(true);
          resetTimer();
        }
      },
      onError: async ({ data }) => {
        if (data?.httpStatus === 401) {
          onOpenDesktopLoginError();
          // setPhoneNumberError({
          //   name: currentPhoneNumberKey,
          //   error: {
          //     type: "conflict",
          //     message:
          //       "Votre numéro de téléphone n'est pas autorisé à accéder à l'application",
          //   },
          // });
        } else {
          setPhoneNumberError({
            name: currentPhoneNumberKey,
            error: {
              type: "internal",
              message: "Erreur coté serveur, veuillez contacter le support",
            },
          });
        }
      },
    });

  const { mutate: loginUser, isLoading: isLoadingLogin } =
    api.user.loginUser.useMutation({
      onSuccess: async ({ data }) => {
        setCookie(
          process.env.NEXT_PUBLIC_JWT_NAME ?? "cje-jwt",
          data.token || "",
          { expires: new Date((data.exp as number) * 1000) }
        );
        router.reload();
        router.push("/dashboard");
      },
      onError: async ({ data }) => {
        if (data?.httpStatus === 401) {
          setHasOtpError(true);
        } else if (data?.httpStatus === 408) {
          setHasOtpExpired(true);
        }
        setForceLoader(false);
      },
    });

  const logoAnimationBreakpoint = useBreakpointValue({
    base: {
      x: ["0px", `-${57 * logoPartners.length + 32 * logoPartners.length}px`],
      transition: {
        repeat: Infinity,
        duration: 4,
        ease: "linear",
      },
    },
    lg: undefined,
  });

  const ellipseImages =
    useBreakpointValue({
      base: [
        "/images/seeds/tags/sport_equipment.png",
        "/images/seeds/tags/computer.png",
        "/images/seeds/tags/grocery.png",
        "/images/seeds/tags/license.png",
        "/images/seeds/tags/culture.png",
        "/images/seeds/tags/clothes.png",
      ],
      lg: [
        "/images/seeds/tags/sport_equipment.png",
        "/images/seeds/tags/books.png",
        "/images/seeds/tags/bike.png",
        "/images/seeds/tags/culture.png",
        "/images/seeds/tags/computer.png",
        "/images/seeds/tags/grocery.png",
        "/images/seeds/tags/washing_machine.png",
        "/images/seeds/tags/desk_equipment.png",
        "/images/seeds/tags/license.png",
        "/images/seeds/tags/clothes.png",
      ],
    }) || [];

  const handleGenerateOtp: SubmitHandler<LoginForm> = async (values) => {
    setCurrentPhoneNumber(values.phone_number);
    generateOtp({ phone_number: values.phone_number, is_desktop: isDesktop });
  };

  const handleLoginUser = async (otp: string) => {
    setForceLoader(true);
    loginUser({
      phone_number: currentPhoneNumber,
      otp,
    });
  };

  useEffect(() => {
    if (!isOtpGenerated) return;
    const id = setInterval(() => {
      setTimeToResend((prevTime) => prevTime - 1);
    }, 1000);
    setIntervalId(id);
    return () => clearInterval(id);
  }, [isOtpGenerated]);

  if (isLoadingLogin || forceLoader || isLoadingLogoPartners || isLoadingFAQ)
    return <BigLoader />;

  if (isOtpGenerated) {
    return (
      <>
        <Flex
          position="relative"
          alignItems="center"
          justifyContent="center"
          pt={8}
        >
          <Icon
            as={HiChevronLeft}
            w={6}
            h={6}
            onClick={() => {
              setIsOtpGenerated(false);
              setCurrentPhoneNumber("");
            }}
            cursor="pointer"
            position="absolute"
            left={6}
          />
          <Text fontWeight={"extrabold"} fontSize={"sm"}>
            Connexion
          </Text>
        </Flex>
        <Flex py={8} px={8} flexDir={"column"}>
          <Heading fontSize={"2xl"} fontWeight={"extrabold"} mb={6}>
            Vous avez reçu un code à 4 chiffres par SMS
          </Heading>
          <Text fontSize={"sm"} fontWeight="medium" color="secondaryText">
            Saisissez le code envoyé au{" "}
            {addSpaceToTwoCharacters(currentPhoneNumber)} pour pouvoir créer
            votre compte
          </Text>
          <Box my={8}>
            <HStack>
              <OtpInput
                shouldAutoFocus
                value={otp}
                onChange={(otp) => {
                  setOtp(otp);
                  setHasOtpError(false);
                  setHasOtpExpired(false);
                  if (otp.length === 4) handleLoginUser(otp);
                }}
                inputType="number"
                numInputs={4}
                placeholder={"----"}
                renderInput={({ style, ...props }) => (
                  <Input
                    {...props}
                    _focus={{
                      _placeholder: {
                        color: "transparent",
                      },
                      borderColor: "blackLight",
                      borderWidth: "2px",
                    }}
                    size="lg"
                    bg={hasOtpError ? "errorLight" : "cje-gray.500"}
                    textAlign="center"
                    borderColor="transparent"
                    _hover={{ borderColor: "transparent" }}
                    _focusVisible={{ boxShadow: "none" }}
                    w={12}
                    h={12}
                    px={0}
                    mx={1}
                  />
                )}
              />
            </HStack>
            {hasOtpExpired && (
              <Text color="error" fontSize={"sm"} mt={2}>
                Le code n'est plus valide, cliquez sur le lien ci-dessous pour
                recevoir un nouveau SMS
              </Text>
            )}
            {hasOtpError && (
              <Text color="error" fontSize={"sm"} mt={2}>
                On dirait que ce code n’est pas le bon
              </Text>
            )}
          </Box>
          <Link
            mt={6}
            textDecor={"underline"}
            fontWeight={"medium"}
            color={timeToResend <= 0 ? "initial" : "gray.500"}
            onClick={() => {
              if (timeToResend <= 0)
                handleGenerateOtp({ phone_number: currentPhoneNumber });
            }}
          >
            Me renvoyer un code par SMS{" "}
            {timeToResend <= 0 ? "" : `(${timeToResend}s)`}
          </Link>
        </Flex>
      </>
    );
  }

  const partnersList = [
    {
      name: "Auchan",
      img: "/images/seeds/partners/auchan.svg",
      promo_label: "-110€",
    },
    {
      name: "Flixbus",
      img: "/images/seeds/partners/flixbus.svg",
      promo_label: "-10%",
    },
    {
      name: "Cora",
      img: "/images/seeds/partners/cora.svg",
      promo_label: "Gratuit",
    },
  ];

  const forWhoList = [
    {
      img: "/images/referent/service-civique.png",
      name: "France travail",
      rotationAngle: -4,
    },
    {
      img: "/images/referent/epide.png",
      name: "France travail",
      rotationAngle: -3,
    },
    {
      img: "/images/referent/mission-locale.png",
      name: "France travail",
      rotationAngle: 6.5,
    },
    {
      img: "/images/referent/france-travail.png",
      name: "France travail",
      rotationAngle: -1,
    },
    {
      img: "/images/referent/e2c.png",
      name: "France travail",
      rotationAngle: 4,
    },
  ];

  return (
    <>
      <Flex
        flexDir="column"
        h="full"
        overflow={{ base: "hidden", lg: "visible" }}
      >
        <Flex
          flexDir="column"
          justify={"center"}
          align={"center"}
          textAlign="center"
          gap={8}
          mt={{ base: 28, lg: 44 }}
          mb={{ base: 24, lg: 36 }}
          pos={"relative"}
          ref={firstSectionRef}
        >
          <Image
            src="/images/cje-logo.png"
            alt="Logo de l'application Carte Jeune Engagé"
            width={{ base: "116px", lg: "176px" }}
            height={{ base: "64px", lg: "94px" }}
          />
          <Box w={"80%"}>
            <Heading
              fontSize={{ base: "2xl", lg: "5xl" }}
              fontWeight="extrabold"
            >
              Des avantages pour les jeunes
              <Box as="br" display={{ base: "none", lg: "block" }} /> qui
              s’engagent pour leur avenir
            </Heading>
            <Text
              fontSize={{ base: "xs", lg: "sm" }}
              fontWeight="medium"
              color="disabled"
              mt={8}
            >
              Dispositif en cours d’expérimentation
            </Text>
          </Box>
          <EllipsePositionnedImages
            images={ellipseImages}
            parentRef={firstSectionRef}
          />
        </Flex>
        {!isDesktop && (
          <Box mt={4} px={2}>
            <PhoneNumberCTA
              currentKey="phone-number-cta"
              setCurrentPhoneNumberKey={setCurrentPhoneNumberKey}
              error={phoneNumberError}
              isLoadingOtp={isLoadingOtp}
              onSubmit={handleGenerateOtp}
            />
          </Box>
        )}
        <Flex
          flexDir={{ base: "column", lg: "row" }}
          bg={"primary"}
          w={{ base: "95%", lg: "full" }}
          mx={"auto"}
          rounded="5xl"
          color={"white"}
          mt={isDesktop ? 0 : 20}
        >
          <Flex
            flex={1}
            flexDir="column"
            p={{ base: 8, lg: 44 }}
            pr={{ lg: 8 }}
            pt={12}
          >
            <Heading
              fontSize={{ base: "2xl", lg: "5xl" }}
              fontWeight="extrabold"
            >
              Une appli utile avec des réductions de grandes marques
            </Heading>
            <Link
              as={NextLink}
              href="/partners"
              mt={6}
              textDecor={"underline"}
              fontWeight={"bold"}
              fontSize={{ lg: "lg" }}
              passHref
            >
              Voir toutes les entreprises
              <Box as="br" display={{ base: "block", lg: "none" }} /> engagées →
            </Link>
          </Flex>
          <Flex
            ref={parentPartnersRef}
            flex={1}
            flexDir="column"
            justify={"center"}
            p={{ base: 8, lg: 44 }}
            px={{ lg: 8 }}
            pt={0}
            position="relative"
            overflow="hidden"
          >
            {partnersList.map((partner, index) => (
              <Flex
                key={`partner-${index}`}
                flexDir={index % 2 === 0 ? "row" : "row-reverse"}
                justifyContent={{ base: "start", lg: "center" }}
                mb={4}
                gap={2}
                h={{ base: 14, lg: 14 }}
              >
                <Flex
                  alignItems="center"
                  justifyContent="center"
                  bg="white"
                  rounded="full"
                  p={4}
                >
                  <Image src={partner.img} alt={`Logo de ${partner.name}`} />
                </Flex>
                <Flex
                  as={Text}
                  align="center"
                  bg="black"
                  fontWeight="extrabold"
                  rounded="full"
                  fontSize="xl"
                  p={4}
                >
                  {partner.promo_label}
                </Flex>
              </Flex>
            ))}
          </Flex>
        </Flex>
        <Flex
          id="who-can-benefit-section"
          flexDir="column"
          bg="bgGray"
          w={{ base: "95%", lg: "full" }}
          mx="auto"
          rounded="5xl"
          mt={20}
          p={{ base: 8, lg: 20 }}
          px={{ lg: 44 }}
          pt={12}
        >
          <Flex>
            <Flex flex={1}>
              <Heading
                fontSize={{ base: "2xl", lg: "5xl" }}
                fontWeight="extrabold"
              >
                Comme une carte étudiant, même si on est pas étudiant.
              </Heading>
            </Flex>
            <Flex
              flex={1}
              justify="end"
              align="center"
              display={{ base: "none", lg: "flex" }}
            >
              <Link
                mt={6}
                textDecor="underline"
                fontWeight={{ base: "bold", lg: "extrabold" }}
                fontSize={{ lg: "lg" }}
                onClick={() => {}}
              >
                Je suis éligible, je crée mon compte →
              </Link>
            </Flex>
          </Flex>
          <Flex
            flexDir={{ base: "column", lg: "row-reverse" }}
            mt={{ base: 5, lg: 6 }}
            gap={{ base: 3, lg: 5 }}
          >
            <Flex
              flexDir={{ base: "row", lg: "column-reverse" }}
              flex={2}
              gap={{ base: 3, lg: 5 }}
            >
              <Flex
                flex={1}
                flexDir="column"
                alignSelf={{ base: "end", lg: "start" }}
                bg="white"
                rounded="2.5xl"
                p={{ base: 4, lg: 6 }}
                fontSize={{ lg: "2xl" }}
                fontWeight={{ base: "medium" }}
              >
                <Text>Pour les</Text>
                <Text fontWeight={{ lg: "extrabold" }}>16-25 ans</Text>
              </Flex>
              <Flex
                flex={1}
                flexDir="column"
                bg="white"
                rounded="2.5xl"
                p={{ base: 4, lg: 8 }}
              >
                <Image
                  src="/images/landing/location.png"
                  fit={"none"}
                  boxSize={"min-content"}
                />
                <Text
                  fontWeight={{ base: "medium", lg: "extrabold" }}
                  fontSize={{ lg: "2xl" }}
                  mt={2}
                >
                  En Val d'Oise
                </Text>
                <Text fontSize={{ base: "xs", lg: "md" }}>
                  uniquement pour la phase d’expérimentation
                </Text>
              </Flex>
            </Flex>
            <Flex
              flex={3}
              flexDir="column"
              alignSelf={{ lg: "start" }}
              bg="white"
              rounded="2.5xl"
              p={{ base: 4, lg: 8 }}
            >
              <Flex
                h={{ base: 16, lg: 28 }}
                mb={4}
                justify={{ base: "center", lg: "start" }}
              >
                {forWhoList.map((item, index) => {
                  return (
                    <Flex
                      justify="center"
                      align="center"
                      alignSelf={index % 2 === 0 ? "start" : "end"}
                      bg="white"
                      w={{ base: 14, lg: 24 }}
                      h={{ base: 14, lg: 24 }}
                      p={2}
                      mr={{ base: -1, lg: -4 }}
                      zIndex={index % 2 === 0 ? 1 : 2}
                      rounded={{ base: "2xl", lg: "3xl" }}
                      boxShadow="0px 14px 10px -5px #F2F2F8"
                      transform={`rotate(${item.rotationAngle}deg)`}
                    >
                      <Image src={item.img} alt={`Logo de ${item.name}`} />
                    </Flex>
                  );
                })}
              </Flex>
              <Text fontWeight={{ base: "medium" }} fontSize={{ lg: "2xl" }}>
                inscrit à France travail
                <Text as="br" display={{ base: "inline-block", lg: "none" }} />
                <Text display={{ base: "none", lg: "inline-block" }}>
                  ,&nbsp;
                </Text>
                en Mission locale
                <Text as="br" display={{ base: "inline-block", lg: "none" }} />
                <Text
                  as={"span"}
                  display={{ base: "none", lg: "inline-block" }}
                >
                  ,&nbsp;
                </Text>
                en Service civique
                <Text as="br" display={{ base: "inline-block", lg: "none" }} />
                <Text
                  as={"span"}
                  display={{ base: "none", lg: "inline-block" }}
                >
                  ,&nbsp;
                </Text>
                en EPIDE
                <Text as="br" display={{ base: "inline-block", lg: "none" }} />
                <Text
                  as={"span"}
                  display={{ base: "none", lg: "inline-block" }}
                >
                  ,&nbsp;
                </Text>
                en École de la 2nde chance
              </Text>
            </Flex>
          </Flex>
        </Flex>
        <Flex
          id="how-does-it-work-section"
          flexDir={{ base: "column", lg: "row-reverse" }}
          bg="frontBlack"
          w={{ base: "95%", lg: "full" }}
          mx={"auto"}
          rounded="2.5xl"
          mt={20}
          gap={{ base: 7, lg: 12 }}
          p={{ base: 8, lg: 20 }}
          pl={{ lg: 44 }}
          pr={{ lg: 8 }}
          py={12}
        >
          <Flex flex={1}>
            <Flex flex={1} alignSelf="start">
              <Image src="/images/landing/auchan-card.gif" fit="contain" />
            </Flex>
            <Flex flex={1} mt={16}>
              <Image src="/images/landing/flixbus-card.gif" fit="contain" />
            </Flex>
          </Flex>
          <Flex flex={1} flexDir="column" color="white" gap={4}>
            <Heading
              fontSize={{ base: "2xl", lg: "5xl" }}
              fontWeight="extrabold"
            >
              Avec des réductions à utiliser en ligne ou en magasin
            </Heading>
            <Text>
              Des réductions pour les courses, pour du matériel informatique et
              pro, pour des vêtements, des loisirs, de la musique et du sport
              entre autres
            </Text>
            <Link
              textDecor="underline"
              fontWeight={{ base: "bold", lg: "extrabold" }}
              fontSize={{ lg: "lg" }}
              onClick={() => {}}
            >
              Voir si je suis éligible →
            </Link>
          </Flex>
        </Flex>
        <Flex
          flexDir={{ base: "column", lg: "row-reverse" }}
          bg={"bgGray"}
          w={{ base: "95%", lg: "full" }}
          mx={"auto"}
          rounded={"2.5rem"}
          mt={20}
          gap={{ base: 7, lg: 12 }}
          p={{ base: 8, lg: 20 }}
          pl={{ lg: 44 }}
          pr={{ lg: 8 }}
          py={12}
        >
          <Flex flex={1} justify="center" align="center">
            <Box pos="relative" w="50%">
              <Image
                src="/images/seeds/tags/culture.png"
                fit="contain"
                pos="absolute"
                left={-12}
                top={50}
                transform="rotate(-11deg)"
              />
              <Image src="/images/landing/offers/cinema-card.png" />
            </Box>
          </Flex>
          <Flex flex={1} flexDir="column" gap={4}>
            <Heading
              as="span"
              fontSize={{ base: "2xl", lg: "5xl" }}
              fontWeight="extrabold"
              mr={1.5}
            >
              Des réductions utiles, pour un cinéma
            </Heading>
            <Text>
              Des réductions pour les courses, pour du matériel informatique et
              pro, pour des vêtements, des loisirs, de la musique et du sport
              entre autres
            </Text>
            <Link
              textDecor={"underline"}
              fontWeight={{ base: "bold", lg: "extrabold" }}
              fontSize={{ lg: "lg" }}
              onClick={() => {}}
            >
              Voir toutes les entreprises engagées →
            </Link>
          </Flex>
        </Flex>
        <Box px={{ base: 10, lg: 44 }} mt={10}>
          <Center
            bgColor="primary"
            borderRadius="2.5xl"
            w="full"
            mt={{ base: 16, lg: 32 }}
          >
            <Image
              src="/images/landing/app-pass-cje.png"
              w="50%"
              mt={{ base: -16, lg: -32 }}
            />
          </Center>
          <Flex
            id="how-to-access-it-section"
            flexDir="column"
            mt={6}
            gap={4}
            px={{ base: 0, lg: "21.5%" }}
            textAlign={{ base: "start", lg: "center" }}
          >
            <Heading
              fontSize={{ base: "2xl", lg: "5xl" }}
              fontWeight="extrabold"
            >
              Comment avoir ma carte “jeune engagé” ?
            </Heading>
            <Text fontWeight={500}>
              La création de votre carte “jeune engagé” dépend de votre
              situation. On vous explique tout ici.
            </Text>
            <Text mt={2} fontWeight={500}>
              Choisissez la situation qui vous correspond le mieux
            </Text>
            <Flex
              flexDir="column"
              p={4}
              borderRadius="2.5xl"
              gap={2}
              bgColor="bgGray"
              textAlign="start"
            >
              <Image src="/images/landing/location.png" boxSize="min-content" />
              <Text fontWeight={500}>
                En Val d’Oise uniquement pour la phase d’expérimentation
              </Text>
            </Flex>
            {referentItems.map(({ name, image, link }, index) => (
              <Flex flexDir="column">
                <Flex
                  key={`referent-${name}`}
                  mt={index === 0 ? 2.5 : 0}
                  alignItems="center"
                  borderRadius="2.5xl"
                  textAlign="start"
                >
                  <Image src={image} w="40px" h="20px" mr={4} />
                  <Text fontWeight={500} noOfLines={1}>
                    {name}
                  </Text>
                  <Icon as={HiMiniChevronRight} w={6} h={6} ml="auto" />
                </Flex>
                <Divider mt={5} />
                {index === referentItems.length - 1 && (
                  <Flex
                    key="referent-none"
                    mt={5}
                    alignItems="center"
                    borderRadius="2.5xl"
                    textAlign="start"
                  >
                    <Text fontWeight={500} noOfLines={1}>
                      Aucune de ces situations
                    </Text>
                    <Icon as={HiMiniChevronRight} w={6} h={6} ml="auto" />
                  </Flex>
                )}
              </Flex>
            ))}
          </Flex>
        </Box>
        <Box px={{ base: 2, lg: 44 }} pt={20} id="faq-section">
          <Box
            bgColor="blackLight"
            color="white"
            py={8}
            px={{ base: 8, lg: "25%" }}
            borderRadius="5xl"
            textAlign={{ base: "start", lg: "center" }}
          >
            <Heading
              size={{ base: "xl", lg: "2xl" }}
              lineHeight="short!important"
              fontWeight="extrabold"
            >
              On répond à vos questions
            </Heading>
            <Accordion mt={4} mb={8} allowToggle>
              {landingFAQ.map(({ title, content }, index) => (
                <FAQSectionAccordionItem
                  key={`faq-item-${index}`}
                  title={title}
                  content={content}
                  index={index}
                  currentIndex={faqCurrentIndex}
                  setCurrentIndex={setFaqCurrentIndex}
                  total={landingFAQ.length}
                />
              ))}
            </Accordion>
          </Box>
          <Box id="why-section" mt={20}>
            <RedirectionSectionBlock />
          </Box>
        </Box>
      </Flex>
      <BaseModal
        isOpen={isOpenDesktopLoginSuccessful}
        onClose={onCloseDesktopLoginSuccessful}
        pt={16}
        pb={40}
      >
        <Flex alignItems="center">
          <Box w="70%">
            <Heading fontSize="5xl" fontWeight="extrabold">
              Vous êtes éligible !
            </Heading>
            <Heading fontSize="5xl" fontWeight="extrabold" mt={10}>
              Téléchargez l’application sur votre téléphone pour continuer.
            </Heading>
            <Text
              fontSize="2xl"
              fontWeight="medium"
              color="secondaryText"
              pr={40}
              mt={16}
            >
              Scannez le QR code avec l’appareil photo de votre téléphone pour
              accéder à l’application carte “jeune engagé” sur votre mobile.
            </Text>
          </Box>
          <Box w="25%" ml="auto" position="relative">
            <QRCodeWrapper
              wrapperProps={{
                zIndex: 20,
                position: "absolute",
                left: "25%",
                top: "50%",
                transform: "translate(-50%, -50%)",
              }}
            />
            <Image
              src="/images/landing/mobile-showcase.png"
              alt="Mobile showcase"
              h="500px"
              opacity={0.5}
              mb={-12}
            />
          </Box>
        </Flex>
      </BaseModal>
      <BaseModal
        isOpen={isOpenDesktopLoginError}
        onClose={onCloseDesktopLoginError}
        pt={16}
        pb={36}
      >
        <NotEligibleForm phone_number={currentPhoneNumber} />
      </BaseModal>
      {isDesktop && (
        <Flex
          flexDir="column"
          gap={4}
          zIndex={10}
          right={8}
          bottom={8}
          position="fixed"
        >
          <Center
            bgColor="primary"
            flexDir="column"
            p={5}
            gap={2}
            borderRadius="2.5xl"
            color="white"
            shadow="landing-qr-code-desktop"
            textAlign="center"
          >
            <Text fontWeight={800} fontSize={14} mb={1} w="min-content">
              Accédez à l’application
            </Text>
            <Box p={1} borderRadius="2lg" bgColor="white" w="fit-content">
              <QRCodeWrapper />
            </Box>
            <Text fontSize={12} fontWeight={500}>
              Disponible
              <br />
              uniquement sur
              <br />
              smartphone 📱
            </Text>
          </Center>
          <Flex flexDir="column" bgColor="bgGray" borderRadius="2.5xl" p={4}>
            <Icon as={HiInformationCircle} w={6} h={6} color="primary" />
            <Text fontSize={14} fontWeight={500} mt={2}>
              Dispotif disponible
              <br />
              uniquement dans le
              <br />
              département du Val
              <br />
              d'Oise (95)
            </Text>
          </Flex>
        </Flex>
      )}
    </>
  );
}
