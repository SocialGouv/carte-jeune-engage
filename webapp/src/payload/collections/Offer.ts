import { type CollectionConfig } from "payload/types";
import { CustomSelectTermsOfUse } from "../components/CustomSelectTermsOfUse";
import { Partner, QuickAccess } from "../payload-types";
import { CustomSelectConditionBlocks } from "../components/CustomSelectBlocksOfUse";
import { CustomSelectKind } from "../components/CustomSelectKind";

export const Offers: CollectionConfig = {
  slug: "offers",
  labels: {
    singular: "Offre",
    plural: "Offres",
  },
  admin: {
    useAsTitle: "formatedTitle",
  },
  fields: [
    {
      name: "title",
      type: "text",
      label: "Titre (en gras)",
      required: true,
    },
    {
      name: "formatedTitle",
      type: "text",
      label: "Titre (formaté)",
      admin: {
        hidden: true,
      },
      hooks: {
        beforeChange: [
          async ({ data, req }) => {
            if (data) {
              let partner: Partner = await req.payload.findByID({
                collection: "partners",
                id: data.partner,
              });
              return `${data.title} ${data.subtitle ?? ""} - (${partner.name})`;
            }
          },
        ],
      },
    },
    {
      name: "subtitle",
      type: "text",
      label: "Complément de titre",
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
      hasMany: true,
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
      name: "source",
      label: "Source",
      required: true,
      defaultValue: "cje",
      admin: {
        position: "sidebar",
      },
      options: [
        { label: "CJE", value: "cje" },
        { label: "Obiz", value: "obiz" },
      ],
    },
    {
      name: "obiz_id",
      type: "text",
      label: "Identifiant Obiz",
      admin: {
        position: "sidebar",
        readOnly: true,
        condition: (_, siblingData) =>
          !!siblingData.source && siblingData.source === "obiz",
      },
    },
    {
      type: "text",
      name: "kind",
      label: "Type",
      required: true,
      admin: {
        position: "sidebar",
        components: {
          Field: CustomSelectKind,
        },
      },
    },
    {
      name: "url",
      type: "text",
      label: "Lien de redirection de l'offre",
      admin: {
        condition: (_, siblingData) =>
          !!siblingData.source &&
          siblingData.source === "cje" &&
          !!siblingData.kind &&
          siblingData.kind.startsWith("code"),
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
          !!siblingData.source &&
          siblingData.source === "cje" &&
          !!siblingData.kind &&
          siblingData.kind.startsWith("voucher"),
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
          !!siblingData.source &&
          siblingData.source === "cje" &&
          !!siblingData.kind &&
          siblingData.kind.startsWith("voucher"),
        position: "sidebar",
      },
    },
    {
      name: "linkOfEligibleStores",
      type: "text",
      label: "Lien des magasins éligibles",
      admin: {
        condition: (_, siblingData) =>
          !!siblingData.source &&
          siblingData.source === "cje" &&
          !!siblingData.kind &&
          siblingData.kind.startsWith("voucher"),
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
          !!siblingData.source &&
          siblingData.source === "cje" &&
          !!siblingData.kind &&
          siblingData.kind === "voucher",
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
      admin: {
        condition: (_, siblingData) =>
          !!siblingData.source && siblingData.source === "cje",
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
      admin: {
        condition: (_, siblingData) =>
          !!siblingData.source && siblingData.source === "cje",
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
      admin: {
        condition: (_, siblingData) =>
          !!siblingData.source && siblingData.source === "cje",
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
      name: "articles",
      type: "array",
      label: "Articles",
      labels: {
        singular: "Article",
        plural: "Articles",
      },
      admin: {
        condition: (_, siblingData) =>
          !!siblingData.source && siblingData.source === "obiz",
      },
      fields: [
        {
          name: "name",
          label: "Nom",
          type: "text",
          required: true,
        },
        {
          name: "reference",
          label: "Référence",
          type: "text",
          required: true,
          unique: true,
        },
        {
          name: "reductionPercentage",
          label: "Pourcentage de réduction",
          type: "number",
          required: true,
          min: 0,
          max: 100,
        },
        {
          name: "validityTo",
          type: "date",
          label: "Article valide jusqu'au (inclus)",
          required: true,
        },
        {
          name: "kind",
          type: "select",
          label: "Type",
          required: true,
          options: [
            { label: "Prix variable", value: "variable_price" },
            { label: "Prix fixe", value: "fixed_price" },
          ],
        },
        {
          name: "minimumPrice",
          label: "Valeure minimum",
          type: "number",
          admin: {
            condition: (_, siblingData) =>
              !!siblingData.kind && siblingData.kind === "variable_price",
          },
        },
        {
          name: "maximumPrice",
          label: "Valeure maximum",
          type: "number",
          admin: {
            condition: (_, siblingData) =>
              !!siblingData.kind && siblingData.kind === "variable_price",
          },
        },
        {
          name: "publicPrice",
          label: "Prix public",
          type: "number",
          admin: {
            condition: (_, siblingData) =>
              !!siblingData.kind && siblingData.kind === "fixed_price",
          },
        },
        {
          name: "price",
          label: "Prix TTC",
          type: "number",
          admin: {
            condition: (_, siblingData) =>
              !!siblingData.kind && siblingData.kind === "fixed_price",
          },
        },
        {
          name: "obizJson",
          label: "Données de Obiz (ne pas toucher)",
          type: "json",
          required: true,
          admin: {
            readOnly: true,
          },
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
    {
      name: "image",
      type: "upload",
      label: "Image",
      relationTo: "media",
      admin: {
        position: "sidebar",
      },
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
