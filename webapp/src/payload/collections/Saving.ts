import { type CollectionConfig } from "payload/types";
import { isAdmin } from "../access/isAdmin";

export const Savings: CollectionConfig = {
  slug: "savings",
  labels: {
    singular: "Économie",
    plural: "Économies",
  },
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: "amount",
      type: "number",
      label: "Montant",
      min: 0,
      admin: {
        step: 0.5,
      },
      required: true,
    },
    {
      name: "coupon",
      type: "relationship",
      label: "Coupon",
      relationTo: "coupons",
      hasMany: false,
      required: true,
    },
  ],
};
