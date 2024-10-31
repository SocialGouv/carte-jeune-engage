import { z } from "zod";
import { FieldMetadata } from "./formHelpers";
import { frenchPhoneNumber } from "../tools";

const withMeta = <T extends z.ZodType>(
  schema: T,
  meta: FieldMetadata
): T & { meta: FieldMetadata } => {
  (schema as any).meta = meta;
  return schema as T & { meta: FieldMetadata };
};

export const signupFormSchema = z.object({
  firstName: withMeta(
    z
      .string()
      .min(2, "Votre prénom doit contenir au moins 2 caractères")
      .max(50, "Votre prénom doit contenir au plus 50 caractères"),
    {
      step: 1,
      stepTitle: "Quel est votre prénom ?",
      stepDescription:
        "Saisissez la même information que sur vos documents administratifs officiels.",
      label: "Prénom",
      kind: "text",
      placeholder: "Votre prénom",
    }
  ),
  civility: withMeta(
    z.enum(["man", "woman"], { message: "Ce champ est obligatoire" }),
    {
      step: 2,
      stepTitle: "Quel est votre nom de famille ?",
      stepDescription:
        "Saisissez la même information que sur vos documents administratifs officiels.",
      label: "Email Address",
      kind: "radio",
      placeholder: "john@example.com",
      options: [
        { label: "Homme", value: "man" },
        { label: "Femme", value: "woman" },
      ],
    }
  ),
  lastName: withMeta(
    z
      .string({ required_error: "Ce champ est obligatoire" })
      .min(2, "Votre nom doit contenir au moins 2 caractères")
      .max(50, "Votre nom doit contenir au plus 50 caractères"),
    {
      step: 2,
      label: "Nom de Famille",
      kind: "text",
      placeholder: "Votre nom de famille",
    }
  ),
  cejFrom: withMeta(
    z.enum(
      [
        "serviceCivique",
        "ecole2ndeChance",
        "epide",
        "franceTravail",
        "missionLocale",
      ],
      { message: "Ce champ est obligatoire" }
    ),
    {
      step: 3,
      stepTitle: "À quel organisme êtes-vous rattaché ?",
      label: "Quel établissement",
      kind: "radio",
      variant: "inline",
      options: [
        {
          value: "serviceCivique",
          label: "Je suis en Service Civique",
          iconSrc: "/images/referent/serviceCivique.png",
        },
        {
          value: "ecole2ndeChance",
          label: "Je suis en école de la 2nde chance",
          iconSrc: "/images/referent/ecole2ndeChance.png",
        },
        {
          value: "epide",
          label: "Je suis en EPIDE",
          iconSrc: "/images/referent/epide.png",
        },
        {
          value: "franceTravail",
          label: "Je suis à France travail",
          iconSrc: "/images/referent/franceTravail.png",
        },
        {
          value: "missionLocale",
          label: "Je suis à la Mission Locale",
          iconSrc: "/images/referent/missionLocale.png",
        },
      ],
    }
  ),
  userEmail: withMeta(
    z
      .string({ required_error: "Ce champ est obligatoire" })
      .email("Veuillez saisir une adresse email valide"),
    {
      step: 4,
      stepTitle: "Votre adresse email",
      stepDescription:
        "Votre adresse email vous servira à récupérer votre compte si il y a un problème avec votre n° de téléphone",
      label: "Votre adresse email",
      kind: "email",
    }
  ),
  birthDate: withMeta(
    z
      .string({ required_error: "Ce champ est obligatoire" })
      .date("Veuillez saisir une date de naissance valide")
      .refine(
        (value) => {
          const brithDate = new Date(value);
          const now = new Date();
          const age = now.getFullYear() - brithDate.getFullYear();
          const hasNot26Yet =
            brithDate.getMonth() >= now.getMonth() &&
            (brithDate.getMonth() === now.getMonth()
              ? brithDate.getDate() > now.getDate()
              : true);
          return age >= 16 && age <= 26 && (age !== 26 ? true : hasNot26Yet);
        },
        { message: "Vous devez avoir entre 16 et 26 ans pour vous inscrire" }
      ),
    {
      step: 5,
      stepTitle: "Votre date de naissance",
      stepDescription:
        "L’application est réservé au 16-25 ans la date de naissance ne sera communiquée à personne",
      label: "Date de naissance",
      kind: "date",
    }
  ),
  address: withMeta(z.string({ required_error: "Ce champ est obligatoire" }), {
    step: 6,
    stepTitle: "Votre adresse",
    stepDescription: "Pour trouver les promotions proches de chez vous.",
    stepImageSrc: "/images/onboarding/map-pin.png",
    label: "Votre adresse",
    kind: "autocomplete",
    placeholder: "Mettez votre adresse complète",
  }),
  preferences: withMeta(
    z.array(z.string().optional()).transform((prefs) => prefs.filter(Boolean)),
    {
      step: 7,
      stepTitle: "Qu’est-ce qui vous intéresse le plus ?",
      kind: "checkbox",
      options: [],
      variant: "inline",
    }
  ),
});

export type SignupFormData = z.infer<typeof signupFormSchema>;

export const signupWidgetFormSchema = z.object({
  civility: withMeta(
    z.enum(["man", "woman"], { message: "Ce champ est obligatoire" }),
    {
      step: 1,
      stepTitle: "Vos codes seront à votre nom, ajoutez vos infos",
      stepDescription:
        "Saisissez la même information que sur vos documents administratifs officiels.",
      autoFocus: false,
      label: "Email Address",
      kind: "radio",
      placeholder: "john@example.com",
      options: [
        { label: "Homme", value: "man" },
        { label: "Femme", value: "woman" },
      ],
    }
  ),
  firstName: withMeta(
    z
      .string()
      .min(2, "Votre prénom doit contenir au moins 2 caractères")
      .max(50, "Votre prénom doit contenir au plus 50 caractères"),
    {
      step: 1,
      label: "Prénom",
      kind: "text",
      placeholder: "Votre prénom",
      autoFocus: false,
    }
  ),
  lastName: withMeta(
    z
      .string({ required_error: "Ce champ est obligatoire" })
      .min(2, "Votre nom doit contenir au moins 2 caractères")
      .max(50, "Votre nom doit contenir au plus 50 caractères"),
    {
      step: 1,
      label: "Nom de Famille",
      kind: "text",
      placeholder: "Votre nom de famille",
      autoFocus: false,
    }
  ),
  birthDate: withMeta(
    z
      .string({ required_error: "Ce champ est obligatoire" })
      .date("Veuillez saisir une date de naissance valide")
      .refine(
        (value) => {
          const brithDate = new Date(value);
          const now = new Date();
          const age = now.getFullYear() - brithDate.getFullYear();
          const hasNot26Yet =
            brithDate.getMonth() >= now.getMonth() &&
            (brithDate.getMonth() === now.getMonth()
              ? brithDate.getDate() > now.getDate()
              : true);
          return age >= 16 && age <= 26 && (age !== 26 ? true : hasNot26Yet);
        },
        { message: "Vous devez avoir entre 16 et 26 ans pour vous inscrire" }
      ),
    {
      step: 1,
      label: "Date de naissance",
      description:
        "La date de naissance est demandée pour certaines offres qui sont réservées au + de 18 ans",
      kind: "date",
      autoFocus: false,
    }
  ),
  address: withMeta(z.string({ required_error: "Ce champ est obligatoire" }), {
    step: 1,
    label: "Votre adresse",
    kind: "autocomplete",
    placeholder: "Mettez votre adresse complète",
    inputView: true,
    autoFocus: false,
  }),
});

export type SignupWidgetFormData = z.infer<typeof signupWidgetFormSchema>;

export const loginWidgetSchema = z.object({
  phoneNumber: withMeta(
    z
      .string({ required_error: "Ce champ est obligatoire" })
      .refine((value) => frenchPhoneNumber.test(value), {
        message: "Veuillez saisir un numéro de téléphone valide",
      }),
    {
      step: 1,
      autocomplete: "tel-national",
      label: "Votre téléphone",
      kind: "text",
      placeholder: "06 00 00 00 00",
    }
  ),
  userEmail: withMeta(
    z
      .string({ required_error: "Ce champ est obligatoire" })
      .email("Veuillez saisir une adresse email valide"),
    {
      step: 1,
      autocomplete: "email",
      label: "Votre adresse email",
      placeholder: "adresse@email.com",
      kind: "email",
    }
  ),
});

export type LoginWidgetFormData = z.infer<typeof loginWidgetSchema>;
