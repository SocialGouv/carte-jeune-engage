import dynamic from "next/dynamic";
import type { Props } from "payload/components/views/List";
import { type CollectionConfig } from "payload/types";
import { getBaseUrl } from "../../utils/tools";
import { sendPushNotification } from "../../utils/sendPushNotification";
import { isAdmin } from "../access/isAdmin";

const ImportCoupons = dynamic<Props>(
  () => import("../components/ImportCoupons"),
  {
    ssr: false,
  }
);

export const Coupons: CollectionConfig = {
  slug: "coupons",
  labels: {
    singular: "Bon de réduction",
    plural: "Bons de réduction",
  },
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: "code",
      type: "text",
      label: "Code",
      required: true,
    },
    {
      name: "used",
      type: "checkbox",
      label: "Utilisé",
      admin: {
        description: "Cette case est cochée si le coupon a été utilisé",
        position: "sidebar",
      },
      defaultValue: false,
    },
    {
      name: "usedAt",
      type: "date",
      label: "Date d'utilisation",
      admin: {
        position: "sidebar",
        // readOnly: true,
      },
    },
    {
      name: "user",
      type: "relationship",
      label: "Utilisateur",
      relationTo: "users",
      hasMany: false,
    },
    {
      name: "assignUserAt",
      type: "date",
      label: "Date d'attribution",
      admin: {
        // readOnly: true,
      },
    },
    {
      name: "offer",
      type: "relationship",
      label: "Offre",
      relationTo: "offers",
      index: true,
      hasMany: false,
      required: true,
    },
  ],
  hooks: {
    afterChange: [
      async ({ doc, previousDoc, operation, req, context }) => {
        if (context.triggerAfterChange === false) {
          return;
        }
        if (operation === "update") {
          if (doc.used !== previousDoc.used) {
            const usedAt = doc.used ? new Date().toISOString() : null;
            req.payload.update({
              collection: "coupons",
              id: doc.id,
              data: {
                usedAt,
                used: doc.used,
              },
              context: {
                triggerAfterChange: false,
              },
            });

            if (doc.used) {
              let tmpUser = doc.user;
              let tmpPartner = { name: "" };

              if (typeof doc.user === "number") {
                const userDoc = await req.payload.findByID({
                  collection: "users",
                  id: doc.user,
                });

                tmpUser = userDoc;
              }

              if (typeof doc.offer === "number") {
                const offerDoc = await req.payload.findByID({
                  collection: "offers",
                  id: doc.offer,
                  depth: 0,
                });

                const partnerDoc = await req.payload.findByID({
                  collection: "partners",
                  id: offerDoc.partner,
                  depth: 0,
                });

                tmpPartner = partnerDoc;
              }

              if (tmpUser && tmpUser.notification_subscription) {
                await sendPushNotification({
                  sub: tmpUser.notification_subscription,
                  payload: req.payload,
                  userId: tmpUser.id,
                  offerId: doc.offer,
                  payloadNotification: {
                    title: "Vos économies sont enregistrées !",
                    message: `Votre réduction ${tmpPartner.name} est ajoutée à vos économies 🎉. Venez voir ce que vous économisez avec la carte “jeune engage” ? 👀`,
                    slug: "coupon-used",
                    url: `${getBaseUrl()}/dashboard/account/history`,
                  },
                });
              }
            }

            doc.usedAt = usedAt;
          } else if (doc.user !== previousDoc.user) {
            const assignUserAt = doc.user ? new Date().toISOString() : null;
            req.payload.update({
              collection: "coupons",
              id: doc.id,
              data: {
                assignUserAt,
                user: typeof doc.user === "object" ? doc.user.id : doc.user,
              },
              context: {
                triggerAfterChange: false,
              },
            });

            doc.assignUserAt = assignUserAt;
          }
        }
      },
    ],
  },
  admin: {
    useAsTitle: "code",
    components: {
      BeforeListTable: [ImportCoupons],
    },
  },
};
