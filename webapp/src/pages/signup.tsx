import {
  Box,
  Button,
  Center,
  Divider,
  Flex,
  Heading,
  Icon,
  ListItem,
  Text,
  UnorderedList,
} from "@chakra-ui/react";
import { useForm, type SubmitHandler, Controller } from "react-hook-form";
import FormInput, { type FieldProps } from "~/components/forms/FormInput";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { HiArrowRight } from "react-icons/hi2";
import LoadingLoader from "~/components/LoadingLoader";
import FormBlock from "~/components/forms/FormBlock";
import { useQuery } from "@tanstack/react-query";
import OnBoardingStepsWrapper from "~/components/wrappers/OnBoardingStepsWrapper";
import { api } from "~/utils/api";
import { getCookie, setCookie } from "cookies-next";
import useDebounceValueWithState from "~/hooks/useDebounceCallbackWithPending";
import FormAutocompleteInput from "~/components/forms/FormAutocompleteInput";
import { useAuth } from "~/providers/Auth";
import Image from "next/image";
import { isIOS } from "~/utils/tools";
import { chakra } from "@chakra-ui/react";
import { motion, isValidMotionProp } from "framer-motion";

const ChakraBox = chakra(motion.div, {
  shouldForwardProp: isValidMotionProp,
});

type SignUpForm = {
  hasAcceptedCGU: boolean;
  civility: "man" | "woman";
  firstName: string;
  lastName: string;
  birthDate: string;
  userEmail: string;
  address: string;
  cejFrom:
    | "serviceCivique"
    | "ecole2ndeChance"
    | "epide"
    | "franceTravail"
    | "missionLocale";
  preferences: string[];
};

export type SignUpFormStep = {
  title: string | JSX.Element;
  description?: string;
  imageUrl?: string;
  field: FieldProps;
};

export const signupSteps = [
  {
    title: "Quel est votre prénom ?",
    description:
      "Saisissez la même information que sur vos documents administratifs officiels.",
    field: {
      name: "firstName",
      kind: "text",
      label: "Prénom",
      placeholder: "Votre prénom",
      rules: {
        required: "Ce champ est obligatoire",
        minLength: {
          value: 2,
          message: "Votre prénom doit contenir au moins 2 caractères",
        },
        maxLength: {
          value: 50,
          message: "Votre prénom ne peut pas contenir plus de 50 caractères",
        },
      },
    },
  },
  {
    title: "On peut vous appeler comment ?",
    description:
      "Saisissez la même information que sur vos documents administratifs officiels.",
    field: {
      name: "civility",
      kind: "block",
      label: "Civilité",
      values: [
        {
          value: "man",
          label: "Monsieur",
        },
        {
          value: "woman",
          label: "Madame",
        },
      ],
      rules: {
        required: "Ce champ est obligatoire",
      },
    },
  },
  {
    title: "Quel est votre nom de famille ?",
    description:
      "Saisissez la même information que sur vos documents administratifs officiels.",
    field: {
      name: "lastName",
      kind: "text",
      label: "Nom de famille",
      placeholder: "Votre nom de famille",
      rules: {
        required: "Ce champ est obligatoire",
        minLength: {
          value: 2,
          message: "Votre nom doit contenir au moins 2 caractères",
        },
        maxLength: {
          value: 50,
          message: "Votre nom ne peut pas contenir plus de 50 caractères",
        },
      },
    },
  },
  {
    title: "À quel organisme êtes-vous rattaché ?",
    field: {
      name: "cejFrom",
      kind: "block",
      values: [
        {
          value: "serviceCivique",
          label: "Je suis en Service Civique",
        },
        {
          value: "ecole2ndeChance",
          label: "Je suis en école de la 2nde chance",
        },
        {
          value: "epide",
          label: "Je suis en EPIDE",
        },
        {
          value: "franceTravail",
          label: "Je suis à France travail",
        },
        {
          value: "missionLocale",
          label: "Je suis à la Mission Locale",
        },
      ],
      label: "Quel établissement",
    },
  },
  {
    title: (
      <Text>
        Votre adresse email
        <Text color="error" fontSize="sm">
          (obligatoire)
        </Text>
      </Text>
    ),
    description:
      "Votre adresse email vous servira à récupérer votre compte si il y a un problème avec votre n° de téléphone",
    field: {
      name: "userEmail",
      kind: "email",
      label: "Email",
      placeholder: "Votre adresse email",
      rules: {
        required: "Ce champ est obligatoire",
        pattern: {
          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
          message: "Veuillez saisir une adresse email valide",
        },
      },
    },
  },
  {
    title: "Votre date de naissance",
    description:
      "L’application est réservé au 16-25 ans la date de naissance ne sera communiquée à personne",
    field: {
      name: "birthDate",
      kind: "date",
      label: "Date de naissance",
      placeholder: "JJ/MM/AAAA",
      rules: {
        required: "Ce champ est obligatoire",
        // rules to validate from 16 years old to 26 years old
        validate: (value: string | number) => {
          const brithDate = new Date(value);
          const now = new Date();
          const age = now.getFullYear() - brithDate.getFullYear();
          const hasNot26Yet =
            brithDate.getMonth() >= now.getMonth() &&
            (brithDate.getMonth() === now.getMonth()
              ? brithDate.getDate() > now.getDate()
              : true);
          return age >= 16 && age <= 26 && (age !== 26 ? true : hasNot26Yet)
            ? true
            : "Vous devez avoir entre 16 et 26 ans pour vous inscrire";
        },
      },
    },
  },
  {
    title: "Votre ville",
    description: "Pour trouver les promotions proches de chez vous.",
    imageUrl: "/images/onboarding/map-pin.png",
    field: {
      name: "address",
      kind: "text",
      label: "Nom de ma ville",
      placeholder: "Chercher le nom de votre ville",
      rules: {
        required: "Ce champ est obligatoire",
      },
    },
  },
  {
    title: "Qu’est-ce qui vous intéresse le plus ?",
    field: {
      name: "preferences",
      kind: "block",
      label: "Préférences",
      rules: {
        required: "Ce champ est obligatoire",
      },
    },
  },
] as SignUpFormStep[];

export default function Signup() {
  const router = useRouter();

  const {
    user,
    refetchUser,
    setShowSplashScreenModal,
    setShowNotificationModal,
  } = useAuth();

  const { signupStep } = router.query as {
    signupStep: keyof Omit<SignUpForm, "hasAcceptedCGU"> | undefined;
  };

  const { mutateAsync: updateUser } = api.user.update.useMutation();

  const [currentSignupStep, setCurrentSignupStep] =
    useState<SignUpFormStep | null>(null);

  const defaultValues = useMemo(() => {
    return typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("cje-signup-form") as string)
      : {};
  }, [typeof window !== "undefined"]);

  const {
    handleSubmit,
    register,
    setValue,
    getValues,
    setError,
    clearErrors,
    watch,
    control,
    formState: { errors },
  } = useForm<SignUpForm>({
    mode: "onBlur",
    defaultValues,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAutocompleteInputFocused, setIsAutocompleteInputFocused] =
    useState(false);

  const onSubmit: SubmitHandler<SignUpForm> = (data) => {
    if (!currentSignupStep) return;
    setIsSubmitting(true);
    const currentStepIndex = signupSteps.findIndex(
      (step) => step.field.name === currentSignupStep.field.name
    );
    if (currentStepIndex === signupSteps.length - 1) {
      localStorage.removeItem("cje-signup-form");
      updateUser({
        ...data,
        preferences: data.preferences.filter(Boolean).map(Number),
      }).then(() => {
        const jwtToken = getCookie(
          process.env.NEXT_PUBLIC_JWT_NAME ?? "cje-jwt"
        );
        if (!jwtToken) return;

        fetch("/api/users/refresh-token", {
          method: "POST",
          credentials: "omit",
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }).then((req) => {
          req.json().then((data) => {
            setCookie(
              process.env.NEXT_PUBLIC_JWT_NAME ?? "cje-jwt",
              data.refreshedToken as string,
              { expires: new Date((data.exp as number) * 1000) }
            );
            refetchUser().then(() => {
              setIsSubmitting(false);
              router.push("/dashboard");
              if (!!user && !user.notification_status && !isIOS()) {
                setShowNotificationModal(true);
              } else {
                setShowSplashScreenModal(true);
              }
            });
          });
        });
      });
    } else {
      const nextStep = signupSteps[currentStepIndex + 1];
      if (!nextStep) return;
      router.push({ query: { signupStep: nextStep.field.name } });
      setCurrentSignupStep(nextStep);
      setIsSubmitting(false);
    }
  };

  const formValues = watch();

  const { data: resultTags } = api.globals.tagsListOrdered.useQuery();
  const { data: tags } = resultTags || { data: [] };

  const [debouncedAddress, isDebouncePending] = useDebounceValueWithState(
    formValues.address,
    500
  );

  const { data: addressOptions, isLoading: isLoadingAddressOptions } = useQuery(
    ["getAddressOptions", debouncedAddress],
    async () => {
      const formatedDebouncedAddress = debouncedAddress.split(",")[0];
      const response = await fetch(
        `https://geo.api.gouv.fr/communes?nom=${formatedDebouncedAddress}&codeDepartement=95&fields=departement&limit=5`
      );
      const data = await response.json();
      return data.map(
        (municipality: any) =>
          `${municipality.nom}, ${municipality.departement.nom}`
      ) as string[];
    },
    {
      enabled: !!debouncedAddress && debouncedAddress.length > 2,
    }
  );

  useEffect(() => {
    const { address, ...tmpFormValues } = formValues;
    localStorage.setItem(
      "cje-signup-form",
      JSON.stringify({ ...tmpFormValues, address: debouncedAddress })
    );
  }, [formValues, debouncedAddress]);

  useEffect(() => {
    if (!signupStep || typeof signupStep !== "string") {
      if (router.isReady)
        router.replace({ query: { signupStep: signupSteps[0].field.name } });
      return;
    }

    const signupStepNames = signupSteps.map((step) => step.field.name);

    const tmpCurrentSignupStep = signupSteps.find(
      (step) => step.field.name === signupStep
    );

    if (!signupStepNames.includes(signupStep) || !tmpCurrentSignupStep) {
      router.back();
      return;
    }

    setCurrentSignupStep(tmpCurrentSignupStep);
  }, [signupStep, router.isReady]);

  if (!currentSignupStep)
    return (
      <Center w="full" h="full">
        <LoadingLoader />
      </Center>
    );

  if (!formValues.hasAcceptedCGU) {
    return (
      <Flex flexDir="column" h="full" pt={8} pb={12}>
        <Heading fontWeight="extrabold" size="xl" px={8}>
          Veuillez accepter les conditions d'utilisation
        </Heading>
        <Divider mt={8} />
        <Box maxH="full" overflowY={"scroll"} pt={8}>
          <Box px={8} pb={36} fontSize={"sm"}>
            <Heading size="sm" fontWeight="extrabold" mb={4}>
              Conditions générales d’utilisation “Jeunes Engagés”
            </Heading>
            <Text color="secondaryText" mb={4}>
              Les présentes conditions générales d’utilisation Jeunes Engagés
              (dites « CGU Jeunes Engagés ») fixent le cadre juridique de
              l’expérimentation de la Plateforme Carte Jeune Engagé et
              définissent les conditions d’accès et d’utilisation des services
              par l’Utilisateur.
              <br />
              Toute utilisation de la Plateforme est subordonnée à l’acceptation
              préalable et au respect intégral des présentes conditions
              générales d’utilisation.
            </Text>
            <Text fontWeight={"bold"} mb={1}>
              Article 1er - Définitions
            </Text>
            <Divider mb={2} mt={1} />
            <Text color="secondaryText" mb={4}>
              “L’Éditeur” : désigne la Fabrique Numérique des ministères sociaux
              qui développe la Plateforme sous la supervision du Délégué
              interministériel à la jeunesse.
            </Text>
            <Text color="secondaryText" mb={4}>
              “Entreprise Engagée” : désigne toute personne morale qui adhère à
              la Plateforme et propose des offres commerciales aux Utilisateurs.
            </Text>
            <Text color="secondaryText" mb={4}>
              “Utilisateur” ou “Jeune Engagé” : désigne toute personne physique
              qui dispose d’un compte sur la Plateforme.
            </Text>
            <Text color="secondaryText" mb={4}>
              “Plateforme” : désigne l’application web Carte Jeune Engagé qui
              permet d'accéder au Service.
            </Text>
            <Text color="secondaryText" mb={4}>
              “Service” : désigne toutes les fonctionnalités offertes par la
              Plateforme pour répondre à ses finalités.
            </Text>
            <Heading size="sm" fontWeight="extrabold" mb={1}>
              Article 2 - Présentation de la plateforme
            </Heading>
            <Divider mb={2} mt={1} />
            <Text color="secondaryText" mb={4}>
              La Plateforme a pour objectif de permettre aux jeunes inscrits
              dans un parcours d’insertion éligible d’accéder à des biens et
              services essentiels à tarif solidaire.
              <br />
              Concrètement, la Plateforme propose aux Jeunes Engagés différentes
              offres commerciales et réductions présentées par des Entreprises
              Engagées.
            </Text>
            <Heading size="sm" fontWeight="extrabold" mb={1}>
              Article 3 - Conditions d’accès
            </Heading>
            <Divider mb={2} mt={1} />
            <Text color="secondaryText" mb={2}>
              L’Utilisateur de la Plateforme doit répondre aux conditions
              suivantes :
            </Text>
            <UnorderedList pl={4} color="secondaryText" mb={4}>
              <ListItem>avoir entre 18 et 25 ans ;</ListItem>
              <ListItem>
                être inscrit dans l’un des parcours d’insertion suivants :
                contrat d’engagement jeune (CEJ), école de la 2ème chance,
                établissement pour l’insertion dans l’emploi (EPIDE), service
                civique.
              </ListItem>
            </UnorderedList>
            <Text color="secondaryText" mb={4}>
              L’accès est libre et gratuit à tout Utilisateur qui remplit les
              conditions d’accès. La non-satisfaction de l’une des conditions
              d’accès entraîne de plein droit et sans préavis la radiation de
              l’Utilisateur.
            </Text>
            <Text color="secondaryText" mb={4}>
              Le présent contrat peut être résilié de plein droit en cas d’arrêt
              du Service sans que le Jeune Engagé ne puisse prétendre à aucune
              indemnisation d’aucune sorte.
            </Text>
            <Heading size="sm" fontWeight="extrabold" mb={1}>
              Article 4 - Fonctionnalités
            </Heading>
            <Divider mb={2} mt={1} />
            <Text color="secondaryText" mb={2} fontWeight={"bold"}>
              4.1 Création du compte
            </Text>
            <Text color="secondaryText" mb={4}>
              La création du compte nécessite de renseigner les informations
              suivantes :
            </Text>
            <UnorderedList mb={4} pl={4} color="secondaryText">
              <ListItem>nom,</ListItem>
              <ListItem>prénom,</ListItem>
              <ListItem>âge,</ListItem>
              <ListItem>numéro de téléphone,</ListItem>
              <ListItem>adresse postale,</ListItem>
              <ListItem>
                photo récente pour les réductions en magasin ou l’accès aux
                salles de sport.
              </ListItem>
            </UnorderedList>
            <Text color="secondaryText" mb={4}>
              L’Utilisateur accède à son compte en renseignant son numéro de
              téléphone.
            </Text>
            <Text color="secondaryText" mb={4} fontWeight={"bold"}>
              4.2 Utiliser un code de réduction
            </Text>
            <Text color="secondaryText" mb={4}>
              L’Utilisateur peut bénéficier des avantages de plusieurs manières
              : via un code promo à usage unique, un code barre à usage unique à
              scanner en caisse, via sa Carte Jeune Engagé à présenter
              uniquement en magasin ou encore via des liens non indexés vers une
              offre spéciale ou un lien vers une offre existante. L’offre est
              automatiquement créditée au profit de l’Utilisateur.
            </Text>
            <Heading size="sm" fontWeight="extrabold" mb={1}>
              Article 5 - Responsabilités
            </Heading>
            <Divider mb={2} mt={1} />
            <Text color="secondaryText" mb={4} fontWeight={"bold"}>
              5.1 L’Éditeur de la Plateforme
            </Text>
            <Text color="secondaryText" mb={4}>
              Les sources des informations diffusées sur la Plateforme sont
              réputées fiables mais la Plateforme ne garantit pas qu’elle soit
              exempte de défauts, d’erreurs ou d’omissions.
              <br />
              L'Éditeur se contente de mettre à disposition les offres
              commerciales des Entreprises Engagées et ne peut en aucune
              circonstance être tenu pour responsable des éventuels différends
              entre l’Utilisateur et l’Entreprise Engagée.
              <br />
              L’Éditeur ne peut voir sa responsabilité recherchée dans le cadre
              des éventuels dysfonctionnements et dommages causés par les biens
              et services proposés sur la Plateforme.
              <br />
              L’Éditeur s’autorise à suspendre ou révoquer n’importe quel compte
              et toutes les actions réalisées par ce biais, s’il estime que
              l’usage réalisé du service porte préjudice à son image ou ne
              correspond pas aux exigences de sécurité.
              <br />
              L’Éditeur s’engage à la sécurisation de la Plateforme, notamment
              en prenant toutes les mesures nécessaires permettant de garantir
              la sécurité et la confidentialité des informations fournies.
              L’Éditeur fournit les moyens nécessaires et raisonnables pour
              assurer un accès continu, sans contrepartie financière, à la
              Plateforme.
              <br />
              Il se réserve la liberté de faire évoluer, de modifier ou de
              suspendre, sans préavis, la Plateforme pour des raisons de
              maintenance ou pour tout autre motif jugé nécessaire.
            </Text>
            <Text color="secondaryText" mb={4} fontWeight={"bold"}>
              5.2 L’Utilisateur
            </Text>
            <Text color="secondaryText" mb={4}>
              L’utilisation du Service est personnelle, à ce titre l’Utilisateur
              n’est pas autorisé à céder ou à permettre l’utilisation du Service
              par un tiers. L’Utilisateur s’engage à fournir une photo pour
              bénéficier d’avantages uniquement disponibles grâce à la Carte
              Jeune Engagé. Il est rappelé que toute personne procédant à une
              fausse déclaration pour elle-même ou pour autrui s’expose,
              notamment, aux sanctions prévues à l’article 441-1 du code pénal,
              prévoyant des peines pouvant aller jusqu’à trois ans
              d’emprisonnement et 45 000 euros d’amende. L’Utilisateur s’engage
              à ne pas mettre en ligne de contenus ou informations contraires
              aux dispositions légales et réglementaires en vigueur.
              L’Utilisateur s’engage à communiquer des données strictement
              nécessaires à sa demande. Il veille particulièrement aux données
              sensibles notamment les données relatives aux opinions
              philosophiques, politiques, syndicales et religieuses.
            </Text>
            <Heading size="sm" fontWeight="extrabold" mb={1}>
              Article 6 - Mise à jour des conditions générales d’utilisation
            </Heading>
            <Divider mb={2} mt={1} />
            <Text color="secondaryText" mb={4}>
              Les termes des présentes CGU peuvent être amendés à tout moment,
              sans préavis, en fonction des modifications apportées à la
              Plateforme, de l’évolution de la législation ou pour tout autre
              motif jugé nécessaire. Chaque modification donne lieu à une
              nouvelle version qui est acceptée par l’Utilisateur.
            </Text>
          </Box>
          <Flex
            direction="column"
            alignItems={"center"}
            borderTopWidth={1}
            px={8}
            pt={3}
            pb={6}
            position={"fixed"}
            bottom={0}
            backgroundColor={"bgWhite"}
            w="full"
          >
            <Text color="disabled" fontWeight={"medium"} fontSize={14}>
              Vous devez accepter pour continuer
            </Text>
            <Button
              size="lg"
              rightIcon={<Icon as={HiArrowRight} w={6} h={6} />}
              w={"full"}
              mt={4}
              onClick={() => setValue("hasAcceptedCGU", true)}
            >
              J'accepte
            </Button>
          </Flex>
        </Box>
      </Flex>
    );
  }

  const currentFieldValue = getValues(
    currentSignupStep.field.name as keyof SignUpForm
  );

  return (
    <OnBoardingStepsWrapper
      stepContext={{
        current:
          signupSteps.findIndex(
            (step) => step.field.name === currentSignupStep.field.name
          ) + 1,
        total: signupSteps.length + 1,
      }}
    >
      <form onSubmit={handleSubmit(onSubmit)} style={{ height: "100%" }}>
        <Flex
          display="flex"
          flexDir="column"
          py={12}
          px={8}
          justifyContent="space-between"
          gap={8}
          h="full"
        >
          <Flex flexDir="column" justifyContent="center">
            <Heading
              as="h1"
              size="lg"
              fontWeight="extrabold"
              textAlign="center"
            >
              {currentSignupStep.title}
            </Heading>
            {!isAutocompleteInputFocused && (
              <>
                <Text
                  fontSize={14}
                  fontWeight="medium"
                  color="secondaryText"
                  mt={4}
                >
                  {currentSignupStep.description}
                </Text>
                {currentSignupStep.imageUrl && (
                  <Center mt={2}>
                    <Image
                      src={currentSignupStep.imageUrl}
                      alt={currentSignupStep.title as string}
                      width={126}
                      height={0}
                    />
                  </Center>
                )}
              </>
            )}
            <Box mt={6} key={currentSignupStep.field.name}>
              {(currentSignupStep.field.name === "civility" ||
                currentSignupStep.field.name === "cejFrom") &&
              currentSignupStep.field.values ? (
                <Flex
                  flexDir={
                    currentSignupStep.field.name === "civility"
                      ? "row"
                      : "column"
                  }
                  alignItems="center"
                  w="full"
                  gap={2}
                >
                  <Controller
                    control={control}
                    name={currentSignupStep.field.name}
                    render={({ field: { onChange, value } }) => (
                      <>
                        {(currentSignupStep.field.values ?? []).map((block) => (
                          <FormBlock
                            key={`${currentSignupStep.field.name}-${block.value}`}
                            variant={
                              currentSignupStep.field.name === "cejFrom"
                                ? "inline"
                                : "default"
                            }
                            iconSrc={
                              currentSignupStep.field.name === "cejFrom"
                                ? `/images/referent/${block.value}.png`
                                : undefined
                            }
                            wrapperIconProps={
                              currentSignupStep.field.name === "cejFrom"
                                ? {
                                    p: 1,
                                    bgColor:
                                      value === block.value
                                        ? "white"
                                        : "inherit",
                                    borderRadius: "2lg",
                                  }
                                : undefined
                            }
                            iconProps={
                              currentSignupStep.field.name === "cejFrom"
                                ? { width: 80, height: 40 }
                                : undefined
                            }
                            value={block.value}
                            currentValue={value}
                            onChange={onChange}
                          >
                            {block.label}
                          </FormBlock>
                        ))}
                      </>
                    )}
                  />
                </Flex>
              ) : currentSignupStep.field.name === "preferences" ? (
                <Flex
                  flexDir="column"
                  alignItems="center"
                  w="full"
                  gap={2}
                  pb={32}
                >
                  {tags.map((tag, index) => (
                    <Controller
                      control={control}
                      name={`preferences.${index}`}
                      render={({ field: { onChange } }) => (
                        <FormBlock
                          key={`${currentSignupStep.field.name}-${tag.id.toString()}`}
                          variant="inline"
                          iconProps={{ width: 48, height: 48 }}
                          value={tag.id.toString()}
                          currentValue={formValues.preferences}
                          iconSrc={tag.icon.url as string}
                          onChange={onChange}
                          withCheckbox
                        >
                          {tag.label}
                        </FormBlock>
                      )}
                    />
                  ))}
                </Flex>
              ) : currentSignupStep.field.name === "address" ? (
                <FormAutocompleteInput
                  control={control}
                  options={addressOptions}
                  setError={setError}
                  clearErrors={clearErrors}
                  isLoading={isLoadingAddressOptions || isDebouncePending}
                  field={currentSignupStep.field}
                  fieldError={
                    errors[
                      currentSignupStep?.field.name as keyof Omit<
                        SignUpForm,
                        "preferences"
                      >
                    ]
                  }
                  handleSubmit={() => handleSubmit(onSubmit)()}
                  setIsInputFocused={setIsAutocompleteInputFocused}
                />
              ) : (
                <FormInput
                  register={register}
                  field={currentSignupStep.field}
                  fieldError={
                    errors[
                      currentSignupStep?.field.name as keyof Omit<
                        SignUpForm,
                        "preferences"
                      >
                    ]
                  }
                />
              )}
            </Box>
          </Flex>
          <Box
            alignSelf="center"
            w={
              currentSignupStep.field.name === "preferences"
                ? "fit-content"
                : "full"
            }
            sx={{
              position:
                currentSignupStep.field.name === "preferences"
                  ? "fixed"
                  : "relative",
              left:
                currentSignupStep.field.name === "preferences" ? "50%" : "auto",
              transform:
                currentSignupStep.field.name === "preferences"
                  ? "translateX(-50%)"
                  : "none",
              bottom:
                currentSignupStep.field.name === "preferences" ? 10 : "auto",
            }}
          >
            <Button
              as={motion.button}
              whileTap={{ scale: 0.95 }}
              animate={{
                transition: { type: "spring", stiffness: 400, damping: 5 },
              }}
              colorScheme="blackBtn"
              isDisabled={
                !currentFieldValue ||
                (currentSignupStep.field.name === "preferences" &&
                  formValues.preferences?.filter(Boolean).length === 0) ||
                errors[currentSignupStep.field.name as keyof SignUpForm]
                  ?.message !== undefined
              }
              w={
                currentSignupStep.field.name === "preferences"
                  ? "fit-content"
                  : "full"
              }
              type="submit"
              rightIcon={<Icon as={HiArrowRight} w={6} h={6} />}
              isLoading={isSubmitting}
            >
              Suivant
            </Button>
          </Box>
        </Flex>
      </form>
    </OnBoardingStepsWrapper>
  );
}
