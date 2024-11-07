import { type CollectionConfig } from "payload/types";
import { isAdmin } from "../access/isAdmin";
import { RowLabelArgs } from "payload/dist/admin/components/forms/RowLabel/types";

export const Orders: CollectionConfig = {
  slug: "orders",
  labels: {
    singular: "Commande",
    plural: "Commandes",
  },
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: "number",
      type: "number",
      label: "Numéro de commande",
      required: true,
    },
    {
      name: "user",
      type: "relationship",
      label: "Utilisateur",
      relationTo: "users",
      required: true,
    },
    {
      name: "offer",
      type: "relationship",
      label: "Offre",
      relationTo: "offers",
      required: true,
    },
    {
      name: "ticket",
      type: "upload",
      label: "PDF",
      relationTo: "media",
    },
    {
      name: "status",
      type: "select",
      label: "État",
      options: [
        { label: "Initialisée", value: "init" },
        { label: "En attente de paiement", value: "awaiting_payment" },
        { label: "Payée", value: "payment_completed" },
        { label: "Livrée", value: "delivered" },
        { label: "Archivée", value: "archived" },
      ],
      required: true,
    },
    {
      name: "obiz_status",
      type: "text",
      label: "État Obiz",
      admin: {
        condition: (_, siblingData) =>
          !!siblingData.status && siblingData.status === "archived",
      },
    },
    {
      name: "payment_url",
      type: "text",
      admin: {
        condition: (_, siblingData) =>
          !!siblingData.status && siblingData.status === "awaiting_payment",
      },
    },
    {
      name: "articles",
      type: "array",
      label: "Panier",
      admin: {
        components: {
          RowLabel: ({ data }: RowLabelArgs) => {
            return `${data.article_reference} (x${data.article_quantity})`;
          },
        },
      },
      fields: [
        {
          name: "article_reference",
          label: "Référence de l'article",
          type: "text",
          required: true,
        },
        {
          name: "article_quantity",
          label: "Quantité",
          type: "number",
          required: true,
        },
        {
          name: "article_montant",
          label: "Montant TTC",
          type: "number",
          required: true,
        },
      ],
    },
  ],
};
