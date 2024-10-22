import {
  Accordion,
  Box,
  Center,
  Divider,
  Flex,
  Heading,
  Icon,
  Image,
  Link,
  Text,
  useBreakpointValue,
} from "@chakra-ui/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { type SubmitHandler, ErrorOption } from "react-hook-form";
import { HiInformationCircle, HiMiniChevronRight } from "react-icons/hi2";
import BigLoader from "~/components/BigLoader";
import { api } from "~/utils/api";
import FAQSectionAccordionItem from "~/components/landing/FAQSectionAccordionItem";
import PhoneNumberCTA, { LoginForm } from "~/components/landing/PhoneNumberCTA";
import QRCodeWrapper from "~/components/landing/QRCode";
import { useAuth } from "~/providers/Auth";
import NextLink from "next/link";
import RedirectionSectionBlock from "~/components/landing/RedirectionSectionBlock";
import LoginWrapper from "~/components/wrappers/LoginWrapper";
import ConditionalLink from "~/components/ConditionalLink";
import LoginOtpContent from "~/components/landing/LoginOtpContent";
import Jumbotron from "~/components/landing/Jumbotron";

const defaultTimeToResend = 30;

const referentItems: { name: string; image: string }[] = [
  {
    name: "Je suis à France Travail",
    image: "/images/referent/franceTravail.png",
  },
  {
    name: "Je suis à la Mission locale",
    image: "/images/referent/missionLocale.png",
  },
  {
    name: "Je suis en Service civique",
    image: "/images/referent/serviceCivique.png",
  },
  {
    name: "Je suis en école de la 2nde chance",
    image: "/images/referent/ecole2ndeChance.png",
  },
  { name: "Je suis à l'EPIDE", image: "/images/referent/epide.png" },
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

const forWhoList = [
  {
    img: "/images/referent/serviceCivique.png",
    name: "France travail",
    rotationAngle: -4,
  },
  {
    img: "/images/referent/epide.png",
    name: "France travail",
    rotationAngle: -3,
  },
  {
    img: "/images/referent/missionLocale.png",
    name: "France travail",
    rotationAngle: 6.5,
  },
  {
    img: "/images/referent/franceTravail.png",
    name: "France travail",
    rotationAngle: -1,
  },
  {
    img: "/images/referent/ecole2ndeChance.png",
    name: "France travail",
    rotationAngle: 4,
  },
];

export default function Home() {
  const {
    isOtpGenerated,
    setIsOtpGenerated,
    showDesktopQRCode,
    setShowDesktopEligibleModal,
  } = useAuth();

  const isDesktop = useBreakpointValue({ base: false, lg: true });

  const [otpKind, setOtpKind] = useState<"otp" | "email">();

  const [timeToResend, setTimeToResend] = useState(defaultTimeToResend);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [faqCurrentIndex, setFaqCurrentIndex] = useState<number | null>(null);

  const [currentPhoneNumber, setCurrentPhoneNumber] = useState<string>("");
  const [phoneNumberError, setPhoneNumberError] = useState<ErrorOption>();

  const parentPartnersRef = useRef<HTMLDivElement>(null);

  const resetTimer = () => {
    if (intervalId) clearInterval(intervalId);
    setTimeToResend(defaultTimeToResend);
    const id = setInterval(() => {
      setTimeToResend((prevTime) => prevTime - 1);
    }, 1000);
    setIntervalId(id);
  };

  const { data: resultFAQ, isLoading: isLoadingFAQ } =
    api.globals.landingFAQGetAll.useQuery();

  const landingFAQ = resultFAQ?.data || [];

  const { data: resultLogoPartners, isLoading: isLoadingPartners } =
    api.partner.getList.useQuery({
      perPage: 3,
      page: 1,
      names: ["deezer", "AXA", "La poste mobile"],
    });

  const landingLogoPartners = resultLogoPartners?.data || [];

  const partnersList = useMemo(() => {
    if (landingLogoPartners.length === 0) return [];
    console.log(landingLogoPartners);
    return [
      {
        name: "Deezer",
        img: landingLogoPartners.find((partner) => partner.name === "Deezer")
          ?.url as string,
        promo_label: "-50%",
      },
      {
        name: "AXA",
        img: landingLogoPartners.find((partner) => partner.name === "AXA")
          ?.url as string,
        promo_label: "-100€",
      },
      {
        name: "La poste mobile",
        img: landingLogoPartners.find(
          (partner) => partner.name === "La poste mobile"
        )?.url as string,
        promo_label: "-10€",
      },
    ];
  }, [landingLogoPartners]);

  const { mutate: generateOtp, isLoading: isLoadingOtp } =
    api.user.generateOTP.useMutation({
      onSuccess: (data) => {
        setIsOtpGenerated(true);
        setOtpKind(data.kind);
        resetTimer();
      },
      onError: async ({ data }) => {
        if (data?.httpStatus === 401) {
          setPhoneNumberError({
            type: "conflict",
            message:
              "Votre numéro de téléphone n'est pas autorisé à accéder à l'application",
          });
        } else {
          setPhoneNumberError({
            type: "internal",
            message: "Erreur coté serveur, veuillez contacter le support",
          });
        }
      },
    });

  const handleGenerateOtp: SubmitHandler<LoginForm> = async (values) => {
    setCurrentPhoneNumber(values.phone_number);
    generateOtp({ phone_number: values.phone_number });
  };

  useEffect(() => {
    if (!isOtpGenerated) return;
    const id = setInterval(() => {
      setTimeToResend((prevTime) => prevTime - 1);
    }, 1000);
    setIntervalId(id);
    return () => clearInterval(id);
  }, [isOtpGenerated]);

  if (isLoadingFAQ || isLoadingPartners) return <BigLoader />;

  if (isOtpGenerated && otpKind)
    return (
      <LoginWrapper
        onBack={() => {
          setIsOtpGenerated(false);
          setOtpKind(undefined);
        }}
      >
        <Box mt={otpKind === "otp" ? 8 : 12}>
          <LoginOtpContent
            otpKind={otpKind}
            currentPhoneNumber={currentPhoneNumber}
            handleGenerateOtp={handleGenerateOtp}
          />
        </Box>
      </LoginWrapper>
    );

  return (
    <>
      <Flex
        flexDir="column"
        h="full"
        overflow={{ base: "hidden", lg: "visible" }}
      >
        <Jumbotron />
        {!isDesktop && (
          <Box px={8} mt={6}>
            <Box mx={4} textAlign="center">
              <Text fontWeight={800}>
                Vous avez été inscrit pour avoir la carte “jeune engagé” ?
              </Text>
              <Text fontWeight={500} color="disabled" mt={2}>
                Connectez-vous avec votre n° de téléphone
              </Text>
            </Box>
            <PhoneNumberCTA
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
              <Text
                mt={6}
                textDecor="underline"
                fontWeight={{ base: "bold", lg: "extrabold" }}
                fontSize={{ lg: "lg" }}
                cursor="pointer"
                onClick={() => setShowDesktopEligibleModal(true)}
              >
                Je suis éligible, je crée mon compte →
              </Text>
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
            <ConditionalLink to="/login" condition={!isDesktop}>
              <Text
                textDecor="underline"
                fontWeight={{ base: "bold", lg: "extrabold" }}
                fontSize={{ lg: "lg" }}
                cursor="pointer"
                onClick={() =>
                  isDesktop ? setShowDesktopEligibleModal(true) : undefined
                }
              >
                Voir si je suis éligible →
              </Text>
            </ConditionalLink>
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
              as={NextLink}
              href="/partners"
              textDecor={"underline"}
              fontWeight={{ base: "bold", lg: "extrabold" }}
              fontSize={{ lg: "lg" }}
              passHref
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
            <Flex flexDir="column">
              {referentItems.map(({ name, image }, index) => (
                <>
                  <ConditionalLink
                    to="/login"
                    condition={!isDesktop}
                    props={{ _hover: { textDecor: "none" } }}
                  >
                    <Flex
                      key={`referent-${name}`}
                      cursor={isDesktop ? "pointer" : "default"}
                      onClick={() => {
                        isDesktop
                          ? setShowDesktopEligibleModal(true)
                          : undefined;
                      }}
                      mt={index === 0 ? 2.5 : 0}
                      py={2}
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
                  </ConditionalLink>
                  <Divider my={2} />
                  {index === referentItems.length - 1 && (
                    <Flex
                      key="referent-none"
                      mt={2}
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
                </>
              ))}
            </Flex>
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
      {isDesktop && showDesktopQRCode && (
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
