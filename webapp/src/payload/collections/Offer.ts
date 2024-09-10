import { type CollectionConfig } from "payload/types";
import { CustomSelectTermsOfUse } from "../components/CustomSelectTermsOfUse";
import { QuickAccess } from "../payload-types";
import { CustomSelectConditionBlocks } from "../components/CustomSelectBlocksOfUse";

export const Offers: CollectionConfig = {
  slug: "offers",
  labels: {
    singular: "Offre",
    plural: "Offres",
  },
  admin: {
    useAsTitle: "title",
  },
  fields: [
    {
      name: "title",
      type: "text",
      label: "Titre",
      required: true,
    },
    {
      name: "partner",
      type: "relationship",
      label: "Partenaire",
      relationTo: "partners",
      hasMany: false,
      required: true,
    },
    {
      name: "category",
      type: "relationship",
      label: "Catégorie",
      relationTo: "categories",
      hasMany: false,
      required: true,
    },
    {
      name: "tags",
      type: "relationship",
      label: "Étiquettes",
      relationTo: "tags",
      hasMany: true,
    },
    {
      name: "validityFrom",
      type: "date",
      label: "Offre valide à partir du",
    },
    {
      name: "validityTo",
      type: "date",
      label: "Offre valide jusqu'au (inclus)",
      required: true,
    },
    {
      type: "select",
      name: "kind",
      label: "Type",
      required: true,
      defaultValue: "voucher",
      options: [
        { label: "[En magasin] Bon d'achat + carte CJE", value: "voucher" },
        { label: "[En magasin] Carte CJE", value: "voucher_pass" },
        { label: "[En ligne] Code de réduction", value: "code" },
        { label: "[En ligne] Espace de réduction", value: "code_space" },
      ],
    },
    {
      name: "url",
      type: "text",
      label: "Lien de redirection de l'offre",
      admin: {
        condition: (_, siblingData) =>
          !!siblingData.kind && siblingData.kind.startsWith("code"),
        position: "sidebar",
      },
      required: true,
    },
    {
      name: "nbOfEligibleStores",
      type: "number",
      label: "Nombre de magasins éligibles",
      admin: {
        condition: (_, siblingData) =>
          !!siblingData.kind && siblingData.kind.startsWith("voucher"),
        position: "sidebar",
      },
      defaultValue: 1,
    },
    {
      name: "imageOfEligibleStores",
      type: "upload",
      label: "Image des magasins éligibles",
      relationTo: "media",
      admin: {
        condition: (_, siblingData) =>
          !!siblingData.kind && siblingData.kind.startsWith("voucher"),
        position: "sidebar",
      },
    },
    {
      name: "linkOfEligibleStores",
      type: "text",
      label: "Lien des magasins éligibles",
      admin: {
        condition: (_, siblingData) =>
          !!siblingData.kind && siblingData.kind.startsWith("voucher"),
        position: "sidebar",
      },
    },
    {
      name: "barcodeFormat",
      type: "select",
      label: "Format du code-barres",
      options: [
        { label: "CODE39", value: "CODE39" },
        { label: "EAN13", value: "EAN13" },
        { label: "ITF14", value: "ITF14" },
        { label: "MSI", value: "MSI" },
        { label: "Pharmacode", value: "pharmacode" },
        { label: "Codabar", value: "codabar" },
        { label: "Upc", value: "upc" },
      ],
      admin: {
        condition: (_, siblingData) =>
          !!siblingData.kind && siblingData.kind === "voucher",
        position: "sidebar",
        description:
          "Si vide, le code-barres est formaté au format CODE128 par défaut",
      },
    },
    {
      name: "termsOfUse",
      type: "array",
      label: "Comment ça marche ?",
      labels: {
        singular: "Étape",
        plural: "Étapes",
      },
      defaultValue: [],
      fields: [
        {
          name: "slug",
          type: "text",
          label: "Texte",
          admin: {
            components: {
              Field: CustomSelectTermsOfUse,
            },
          },
        },
        {
          name: "isHighlighted",
          type: "checkbox",
          label: "Mettre en avant ?",
        },
      ],
    },
    {
      name: "conditions",
      type: "array",
      label: "Conditions",
      labels: {
        singular: "Condition",
        plural: "Conditions",
      },
      fields: [
        {
          name: "text",
          type: "text",
          label: "Texte",
          required: true,
        },
      ],
    },
    {
      name: "conditionBlocks",
      type: "array",
      label: "Condition Blocs",
      labels: {
        singular: "Condition Bloc",
        plural: "Condition Blocs",
      },
      fields: [
        {
          name: "slug",
          type: "text",
          label: "Texte",
          admin: {
            components: {
              Field: CustomSelectConditionBlocks,
            },
          },
          required: true,
        },
      ],
    },
    {
      name: "nbSeen",
      type: "number",
      label: "Nombre de vues",
      defaultValue: 0,
      // hidden: true
    },
  ],
  hooks: {
    afterDelete: [
      async ({ req, id }) => {
        // Delete on cascade the related quickAccess item
        let currentQuickAccess: QuickAccess = await req.payload.findGlobal({
          slug: "quickAccess",
          depth: 0,
        });

        currentQuickAccess.items = currentQuickAccess.items?.filter(
          (item) => item.offer !== id
        );

        await req.payload.updateGlobal({
          slug: "quickAccess",
          data: currentQuickAccess,
        });
      },
    ],
  },
};
