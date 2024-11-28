import { type CollectionConfig } from "payload";
import { User } from "../payload-types";
import { getBaseUrl } from "../../utils/tools";
import UserCustomView from "../components/UserCustomView";
// import type { Props } from "payload/components/views/List";
import dynamic from "next/dynamic";
import { isAdmin, isAdminOrSelf } from "../access/isAdmin";

// const ExportUsers = dynamic<Props>(() => import("../components/ExportUsers"), {
//   ssr: false,
// });

const getHtmlPassAccepted = (user: User) => {
  return `
    <p>Bonjour${user.firstName ? ` ${user.firstName}` : ""},</p>
    <p>Votre carte CJE est prête pour toutes les réductions en magasin.</p>
    <p>Activez les offres en magasin qui vous intéressent pour en bénéficier en présentant votre carte.</p>
    <a href="${getBaseUrl()}/dashboard/wallet">Rendez-vous ici</a>
    <p>Carte "jeune engagé"</p>
  `;
};

const getHtmlPassRejected = (user: User) => {
  return `
    <p>Bonjour${user.firstName ? ` ${user.firstName}` : ""},</p>
    <p>Pour vos réductions en magasin, la photo que vous avez envoyé pour créer votre carte CJE ne correspond pas aux critères.</p>
    <p>Vous pouvez ajoutez une autre photo dès maintenant pour créer votre carte CJE.</p>
    <a href="${getBaseUrl()}/dashboard/account">Rendez-vous ici</a>
    <p>Carte "jeune engagé"</p>
  `;
};

export const Users: CollectionConfig = {
  slug: "users",
  auth: {
    tokenExpiration: 15568320,
  },
  labels: {
    singular: "Utilisateur",
    plural: "Utilisateurs",
  },
  admin: {
    useAsTitle: "email",
    components: {
      // BeforeListTable: [ExportUsers],
      // views: {
      //   Edit: UserCustomView,
      // },
    },
  },
  access: {
    read: isAdminOrSelf,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: "phone_number",
      type: "text",
      required: true,
      unique: true,
      label: "Numéro de téléphone",
    },
    {
      name: "civility",
      type: "select",
      label: "Civilité",
      options: [
        {
          label: "Monsieur",
          value: "man",
        },
        {
          label: "Madame",
          value: "woman",
        },
      ],
    },
    {
      name: "birthDate",
      type: "date",
      label: "Date de naissance",
    },
    {
      name: "firstName",
      type: "text",
      saveToJWT: true,
      label: "Prénom",
    },
    {
      name: "lastName",
      type: "text",
      label: "Nom",
    },
    {
      name: "address",
      type: "text",
      label: "Adresse",
    },
    {
      name: "image",
      type: "upload",
      label: "Photo de profil",
      relationTo: "media",
    },
    {
      name: "userEmail",
      type: "text",
      label: "Email de l'utilisateur",
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "cejFrom",
      type: "select",
      label: "Établissement CEJ",
      options: [
        {
          label: "France travail",
          value: "franceTravail",
        },
        {
          label: "Mission locale",
          value: "missionLocale",
        },
        {
          label: "Service civique",
          value: "serviceCivique",
        },
        {
          label: "École de la 2nde chance",
          value: "ecole2ndeChance",
        },
        {
          label: "EPIDE",
          value: "epide",
        },
      ],
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "timeAtCEJ",
      type: "select",
      label: "Temps passé au CEJ",
      options: [
        {
          label: "Viens de s'inscrire",
          value: "started",
        },
        {
          label: "Moins de 3 mois",
          value: "lessThan3Months",
        },
        {
          label: "Plus de 3 mois",
          value: "moreThan3Months",
        },
      ],
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "hasAJobIdea",
      type: "select",
      label: "Pense à une idée de formation ou métier",
      options: [
        {
          label: "Oui",
          value: "yes",
        },
        {
          label: "Non pas encore",
          value: "no",
        },
      ],
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "projectTitle",
      type: "text",
      label: "Projet",
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "projectDescription",
      type: "textarea",
      label: "Description du projet",
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "status_image",
      type: "select",
      label: "Statut de la photo de profil",
      defaultValue: "pending",
      options: [
        {
          label: "En attente",
          value: "pending",
        },
        {
          label: "Validée",
          value: "approved",
        },
      ],
    },
    {
      name: "preferences",
      saveToJWT: true,
      type: "relationship",
      label: "Préférences",
      relationTo: "tags",
      hasMany: true,
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "notification_status",
      type: "select",
      options: [
        {
          label: "Activée",
          value: "enabled",
        },
        {
          label: "Désactivée",
          value: "disabled",
        },
      ],
      label: "Notification activée",
      admin: {
        // readOnly: true,
        position: "sidebar",
      },
    },
    {
      name: "notification_subscription",
      type: "json",
      admin: {
        readOnly: true,
      },
      label: "Notification",
    },
    {
      name: "otp_request_token",
      type: "text",
      admin: {
        readOnly: true,
      },
      label: "OTP request (ne pas toucher)",
    },
    {
      name: "cej_id",
      type: "text",
      unique: true,
      admin: {
        readOnly: true,
      },
      label: "Identifiant CEJ (ne pas toucher)",
    },
  ],
  hooks: {
    afterChange: [
      async ({ req, operation, doc, previousDoc }) => {
        const user = doc as User;
        const previousUser = previousDoc as User;
        if (operation === "update" && user.userEmail) {
          if (
            user.image &&
            user.status_image === "approved" &&
            previousUser.status_image === "pending"
          ) {
            await req.payload.sendEmail({
              from: process.env.SMTP_FROM_ADDRESS,
              to: user.userEmail,
              subject: "CJE - Votre carte CJE est prête !",
              html: getHtmlPassAccepted(user),
            });
          } else if (
            !user.image &&
            previousUser.image &&
            user.status_image === "pending"
          ) {
            await req.payload.sendEmail({
              from: process.env.SMTP_FROM_ADDRESS,
              to: user.userEmail,
              subject: "CJE - Votre photo de profil a été refusée",
              html: getHtmlPassRejected(user),
            });
          }
        }
      },
    ],
  },
};
