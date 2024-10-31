import { type CollectionConfig } from "payload/types";
import { QuickAccess } from "../payload-types";
import { isAdmin } from "../access/isAdmin";

export const Partners: CollectionConfig = {
  slug: "partners",
  labels: {
    singular: "Partenaire",
    plural: "Partenaires",
  },
  admin: {
    useAsTitle: "name",
  },
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: "name",
      type: "text",
      label: "Nom",
      required: true,
      unique: true,
    },
    {
      name: "description",
      type: "textarea",
      label: "Description",
    },
    {
      name: "url",
      type: "text",
      label: "URL",
    },
    {
      name: "color",
      type: "text",
      label: "Couleur",
      required: true,
    },
    {
      name: "icon",
      type: "upload",
      label: "Icône",
      required: true,
      relationTo: "media",
    },
    {
      name: "stared",
      type: "checkbox",
      label: "Mettre en avant",
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
          (item) => item.partner !== id
        );

        await req.payload.updateGlobal({
          slug: "quickAccess",
          data: currentQuickAccess,
        });
      },
    ],
  },
};
