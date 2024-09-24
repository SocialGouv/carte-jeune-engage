import {
  Accordion,
  AspectRatio,
  Box,
  Flex,
  HStack,
  Heading,
  Icon,
  Image,
  Input,
  Link,
  PinInput,
  PinInputField,
  Text,
  chakra,
  shouldForwardProp,
  useBreakpointValue,
  useDisclosure,
} from "@chakra-ui/react";
import { useGSAP } from "@gsap/react";
import { setCookie } from "cookies-next";
import { isValidMotionProp, motion } from "framer-motion";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { type SubmitHandler, ErrorOption } from "react-hook-form";
import {
  HiCalendarDays,
  HiChevronLeft,
  HiMapPin,
  HiMiniClipboardDocumentCheck,
} from "react-icons/hi2";
import BigLoader from "~/components/BigLoader";
import ChakraNextImage from "~/components/ChakraNextImage";
import Header from "~/components/landing/Header";
import { loginAnimation } from "~/utils/animations";
import { api } from "~/utils/api";
import { addSpaceToTwoCharacters } from "~/utils/tools";
import SectionContent from "~/components/landing/SimpleSection";
import MapSectionCard from "~/components/landing/MapSectionCard";
import HowItWorksSectionCard from "~/components/landing/HowItWorkSectionCard";
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

const ChakraBox = chakra(motion.div, {
  shouldForwardProp: (prop) =>
    isValidMotionProp(prop) || shouldForwardProp(prop),
});

const defaultTimeToResend = 30;

const sectionItems = [
  {
    title:
      "Bénéficiez d’un statut privilégié qui vous offre des remises avantageuses",
    description:
      "Vous êtes inscrit en Mission locale, à France Travail ou vous êtes en Service civique vous bénéficiez d’un statut de jeune engagé, avec la carte “jeune engagé”, vous accédez à toutes les réductions disponibles pour vous !",
    image: "/images/landing/section-1.png",
  },
  {
    title:
      "Tout ce qu’il faut pour bien démarrer dans la vie active, à prix réduit grâce aux partenaires",
    description:
      "La carte “jeune engagé” vous fait économiser pour tout grâce aux nombreux partenaires participants. Bénéficiez de prix instantanément réduits pour faire vos courses, pour équiper votre logement, pour le matériel informatique mais aussi pour vos assurances et vos abonnements. ",
    image: "/images/landing/section-2.png",
  },
  {
    title: "Des réductions à utiliser en ligne ou en magasin",
    description:
      "Profitez d’une flexibilité totale avec la carte “jeune engagé” ! L’application vous offre des réductions à utiliser en ligne mais aussi directement en magasin : plus pratique pour faire vos courses par exemple. ",
    image: "/images/landing/section-3.png",
  },
  {
    title: "Suivez toutes vos économies",
    description:
      "Gardez un œil sur vos économies grâce à notre fonction de suivi intégrée. Consultez facilement l'historique de vos économies et suivez les au fil du temps. ",
    image: "/images/landing/section-4.png",
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

  useGSAP(() => {
    // loginAnimation();
  }, []);

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
        <Flex
          flexDir={{ base: "column", lg: "row" }}
          bg={"primary"}
          w={{ base: "95%", lg: "full" }}
          mx={"auto"}
          rounded={"2.5rem"}
          color={"white"}
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
              mt={6}
              textDecor={"underline"}
              fontWeight={"bold"}
              fontSize={{ lg: "lg" }}
              onClick={() => {}}
            >
              Voir toutes les entreprises
              <Box as="br" display={{ base: "block", lg: "none" }} /> engagées →
            </Link>
          </Flex>
          <Flex
            flex={1}
            flexDir="column"
            justify={"center"}
            p={{ base: 8, lg: 44 }}
            px={{ lg: 8 }}
            pt={0}
          >
            {partnersList.map((partner, index) => (
              <Flex
                key={`partner-${index}`}
                justify={"center"}
                gap={8}
                mb={4}
                h={{ base: 10, lg: 14 }}
              >
                <Flex
                  alignItems="center"
                  justifyContent="center"
                  bg={"white"}
                  rounded={"full"}
                  p={4}
                >
                  <Image src={partner.img} alt={`Logo de ${partner.name}`} />
                </Flex>
                <Flex
                  as={Text}
                  align={"center"}
                  bg={"black"}
                  fontWeight={"extrabold"}
                  rounded={"full"}
                  fontSize={"xl"}
                  p={4}
                >
                  {partner.promo_label}
                </Flex>
              </Flex>
            ))}
          </Flex>
        </Flex>
        <Flex
          flexDir={"column"}
          bg={"bgGray"}
          w={{ base: "95%", lg: "full" }}
          mx={"auto"}
          rounded={"2.5rem"}
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
              justify={"end"}
              align={"center"}
              display={{ base: "none", lg: "flex" }}
            >
              <Link
                mt={6}
                textDecor={"underline"}
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
                flexDir={"column"}
                alignSelf={{ base: "end", lg: "start" }}
                bg={"white"}
                rounded={"1.25rem"}
                p={{ base: 4, lg: 6 }}
                fontSize={{ lg: "2xl" }}
                fontWeight={{ base: "medium" }}
              >
                <Text>Pour les</Text>
                <Text fontWeight={{ lg: "extrabold" }}>16-25 ans</Text>
              </Flex>
              <Flex
                flex={1}
                flexDir={"column"}
                bg={"white"}
                rounded={"1.25rem"}
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
              flexDir={"column"}
              alignSelf={{ lg: "start" }}
              bg={"white"}
              rounded={"1.25rem"}
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
                      justify={"center"}
                      align={"center"}
                      alignSelf={index % 2 === 0 ? "start" : "end"}
                      bg={"white"}
                      w={{ base: 14, lg: 24 }}
                      h={{ base: 14, lg: 24 }}
                      p={2}
                      mr={{ base: -1, lg: -4 }}
                      zIndex={index % 2 === 0 ? 1 : 2}
                      rounded={{ base: "2xl", lg: "3xl" }}
                      boxShadow={"0px 14px 10px -5px #F2F2F8"}
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
        {/* <Flex
          id="login-form"
          alignItems="center"
          px={8}
          mt={10}
          mb={24}
          justifyContent={{ base: "center", lg: "space-between" }}
          textAlign={{ base: "center", lg: "left" }}
        >
          <Box w={{ base: "full", lg: "65%" }}>
            <Heading
              fontSize={{ base: "2xl", lg: "56px" }}
              fontWeight="extrabold"
              px={{ base: 2, lg: 0 }}
            >
              Des remises exclusives pour les jeunes qui vont commencer la vie
              active. Avec la carte “jeune engagé”
            </Heading>
            <Text
              fontSize={{ base: "lg", lg: "28px" }}
              fontWeight="medium"
              color="secondaryText"
              mt={8}
            >
              Les économies pensées pour bien démarrer dans la vie&nbsp;
              <Box as="br" display={{ base: "none", lg: "block" }} />
              et pour toutes ses dépenses quotidiennes.
            </Text>
            <PhoneNumberCTA
              isLoadingOtp={isLoadingOtp}
              onSubmit={handleGenerateOtp}
              currentKey="phone-number-cta"
              error={phoneNumberError}
              setCurrentPhoneNumberKey={setCurrentPhoneNumberKey}
            />
          </Box>
          <Image
            h="600px"
            display={{ base: "none", lg: "block" }}
            src="/images/landing/main.png"
          />
        </Flex> */}
        {/* <Flex flexDir="column" textAlign="center" gap={8}>
          <Heading fontSize="3xl" fontWeight="extrabold">
            Ils vous offrent{" "}
            <Box as="br" display={{ base: "block", lg: "none" }} />
            des remises
          </Heading>
          <Flex overflowX="hidden" whiteSpace="nowrap">
            <ChakraBox
              display="flex"
              justifyContent={{ base: "normal", lg: "space-around" }}
              w="full"
              animate={logoAnimationBreakpoint}
              ml={{ base: 8, lg: 0 }}
              mx={{ base: 0, lg: "auto" }}
              gap={8}
            >
              {logoPartners.map((logo, index) => (
                <ChakraNextImage
                  key={`logo-${index}`}
                  display="inline-block"
                  src={logo.url as string}
                  alt={logo.alt as string}
                  width={57}
                  height={57}
                  filter="grayscale(100%)"
                />
              ))}
              {logoPartners.map((logo, index) => (
                <ChakraNextImage
                  key={`logo-duplicate-${index}`}
                  display={{ base: "inline-block", lg: "none" }}
                  src={logo.url as string}
                  alt={logo.alt as string}
                  width={57}
                  height={57}
                  filter="grayscale(100%)"
                />
              ))}
            </ChakraBox>
          </Flex>
          <Text fontWeight="bold" fontSize="2xl">
            Et encore plein d’autres...
          </Text>
        </Flex> */}
        {/* <Flex
          id="what-is-it-section"
          flexDir="column"
          px={8}
          pt={{ base: 10, lg: 24 }}
          mt={{ base: 0, lg: 16 }}
          gap={{ base: 9, lg: 40 }}
        >
          {sectionItems.map((section, index) => (
            <SectionContent key={`section-${index}`} {...section} />
          ))}
        </Flex> */}
        {/* <Box
          id="who-can-benefit-section"
          pt={{ base: 20, lg: 28 }}
          mt={{ base: 0, lg: 12 }}
          zIndex={10}
        >
          <Heading
            size={{ base: "xl", lg: "2xl" }}
            fontWeight="extrabold"
            textAlign="center"
          >
            Qui peut en profiter ?
          </Heading>
          <Flex
            position="relative"
            flexDirection={{ base: "column", lg: "row-reverse" }}
            alignItems="center"
            mt={{ base: 8, lg: 16 }}
          >
            <AspectRatio
              w="full"
              position={{ base: "relative", lg: "absolute" }}
              zIndex={-1}
              pt={4}
              mb={-10}
              overflow="hidden"
            >
              <Image
                src={`/images/landing/map${!isDesktop ? "-mobile" : ""}.png`}
                transform="rotate(-4.5deg)"
              />
            </AspectRatio>
            <Flex
              flexDir="column"
              px={8}
              gap={8}
              w={{ base: "auto", lg: "42%" }}
              mr="auto"
            >
              <MapSectionCard
                text="Disponible uniquement dans le département du Val d’Oise"
                icon={HiMapPin}
              />
              <MapSectionCard
                text="Réservé aux jeunes inscrits à la Mission locale, à France travail ou engagé en Service civique"
                icon={HiMiniClipboardDocumentCheck}
              />
              <MapSectionCard
                text="Réservé aux jeunes ni en emploi, ni en formation, âgés entre 18 et 25 ans."
                icon={HiCalendarDays}
              />
            </Flex>
          </Flex>
        </Box> */}
        <Box px={8}>
          <Box
            id="how-does-it-work-section"
            pt={{ base: 24, lg: 28 }}
            mt={{ base: 0, lg: 12 }}
            textAlign="center"
          >
            <Heading fontWeight="extrabold" size={{ base: "xl", lg: "2xl" }}>
              Comment ça marche ?
            </Heading>
            <Text
              fontWeight="medium"
              fontSize="sm"
              color="secondaryText"
              mt={8}
            >
              Rappel : vous devez être à France Travail ou à la Mission locale,
              ou engagé en Service civique.
            </Text>
            <Flex flexDir={{ base: "column", lg: "row" }} gap={8} mt={9}>
              <HowItWorksSectionCard
                title="Votre conseiller vous inscrit"
                description="Vous avez été inscrit par votre Service civique, conseiller Mission locale ou France travail et vous recevez le SMS d’invitation"
                number={1}
              />
              <HowItWorksSectionCard
                title="Créez votre compte sur l’application"
                description="Téléchargez l’application et créez votre compte pour accéder aux offres et aux réductions."
                number={2}
              />
              <HowItWorksSectionCard
                title="Bénéficiez de vos réductions"
                description="Dès qu’une réduction vous intéresse, activez-la et profitez-en en ligne ou en magasin."
                number={3}
              />
            </Flex>
          </Box>
          <Box
            id="faq-section"
            pt={{ base: 24, lg: 28 }}
            mt={{ base: 0, lg: 12 }}
            textAlign="center"
          >
            <Heading size={{ base: "xl", lg: "2xl" }} fontWeight="extrabold">
              Questions fréquentes
            </Heading>
            <Accordion my={10} allowToggle>
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
          <Flex
            flexDir="column"
            mt={{ base: 16, lg: 48 }}
            mb={{ base: 8, lg: 24 }}
            textAlign="center"
          >
            <Heading size={{ base: "xl", lg: "2xl" }} fontWeight="extrabold">
              Je profite des réductions{" "}
              <Box as="br" display={{ base: "block", lg: "none" }} />
              dès maintenant
            </Heading>
            <Text
              fontWeight="medium"
              color="secondaryText"
              w={{ base: "full", lg: "60%" }}
              alignSelf={{ lg: "center" }}
              fontSize={{ base: "md", lg: "2xl" }}
              mt={{ base: 6, lg: 12 }}
            >
              Accédez aux réductions et aux offres des entreprises qui aident
              les jeunes à se lancer dans la vie active.
            </Text>
            <Box w={{ base: "full", lg: "60%" }} alignSelf={{ lg: "center" }}>
              <PhoneNumberCTA
                isLoadingOtp={isLoadingOtp}
                onSubmit={handleGenerateOtp}
                currentKey="phone-number-footer"
                error={phoneNumberError}
                setCurrentPhoneNumberKey={setCurrentPhoneNumberKey}
              />
            </Box>
          </Flex>
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
          zIndex={10}
          bgColor="white"
          flexDir="column"
          position="fixed"
          right={8}
          bottom={8}
          p={4}
          borderRadius="2xl"
          shadow="landing-qr-code-desktop"
        >
          <Text fontWeight="extrabold" mb={1} mx="auto">
            Accéder à l’application
          </Text>
          <QRCodeWrapper size={181} />
        </Flex>
      )}
    </>
  );
}
