import { type CollectionConfig } from "payload";
import { isAdmin } from "../access/isAdmin";

export const OrderSignals: CollectionConfig = {
  slug: "ordersignals",
  labels: {
    singular: "Signalement",
    plural: "Signalements",
  },
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: "order",
      type: "relationship",
      label: "Signalement",
      relationTo: "orders",
      required: true,
      unique: true,
    },
  ],
};
