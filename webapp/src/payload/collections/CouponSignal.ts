import { type CollectionConfig } from "payload/types";
import { isAdmin } from "../access/isAdmin";

export const CouponSignals: CollectionConfig = {
  slug: "couponsignals",
  labels: {
    singular: "Signalement (cje)",
    plural: "Signalements (cje)",
  },
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: "coupon",
      type: "relationship",
      label: "Signalement",
      relationTo: "coupons",
      required: true,
      unique: true,
    },
    {
      name: "cause",
      type: "text",
      label: "Cause",
    },
  ],
};
