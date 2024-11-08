import { Order, User } from "~/payload/payload-types";
import {
  extractAddressInformations,
  getBaseUrl,
  getTodayFrenchDate,
  removeProtocolFromUrl,
} from "./tools";
import { OfferArticle } from "~/server/types";

var crypto = require("crypto");

export const obiz_signature = crypto
  .createHash("sha512")
  .update(`${process.env.OBIZ_PARTNER_ID}+${process.env.OBIZ_SECRET}`)
  .digest("hex") as string;

export const createOrderPayload = (
  user: User,
  order: Order,
  kind: "CARTECADEAU" | "EBILLET"
) => {
  const { street_address, city, zip_code } = extractAddressInformations(
    user.address || ""
  );

  const signature = crypto
    .createHash("sha512")
    .update(
      `${kind}+${user.id.toString()}+CB +${street_address}+Maison+${zip_code}+${user.userEmail || user.email}+${user.lastName || "Inconnu"}+${user.firstName || "Inconnu"}+${city}+${process.env.OBIZ_SECRET}`
    )
    .digest("hex") as string;

  return {
    SIGNATURE: signature,
    TABLE_CE: {
      string: [
        process.env.OBIZ_PARTNER_ID,
        "Numéricité",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
      ],
    },
    TABLE_UTILISATEUR: {
      string: [
        user.id.toString(),
        "",
        "",
        user.lastName || "Inconnu",
        user.firstName || "Inconnu",
        user.phone_number,
        user.phone_number,
        "",
        user.userEmail || user.email,
        "Maison",
        street_address,
        "",
        zip_code,
        city,
        "France",
        user.birthDate || "01/01/1970",
      ],
    },
    TABLE_COMMANDE: {
      string: [
        "0",
        "0",
        "CB ",
        "0",
        kind,
        "",
        "",
        "Adresse de facturation",
        street_address,
        "",
        zip_code,
        city,
        "FRANCE",
        "",
        `${removeProtocolFromUrl(getBaseUrl())}/dashboard/order/${order.id}/success`, // url_retour_ok
        `${removeProtocolFromUrl(getBaseUrl())}/dashboard/order/${order.id}/error`, // url_retour_ko
        "",
        "",
        "",
        "",
        "",
        "",
      ],
    },
  };
};

export const insertItemPayload = (
  orderNumber: string,
  user: User,
  articles: (OfferArticle & { quantity: number })[],
  kind: "CARTECADEAU" | "EBILLET",
  amount?: number
) => {
  const signature = crypto
    .createHash("sha512")
    .update(
      `${process.env.OBIZ_PARTNER_ID}+${orderNumber}+${process.env.OBIZ_SECRET}`
    )
    .digest("hex") as string;

  const todayDate = getTodayFrenchDate();

  return {
    signature: signature,
    LONGUEUR_TABLE_ARTICLE: 21,
    TABLE_ARTICLES: {
      string: articles.flatMap((article) => [
        article.reference,
        article.quantity,
        amount || article.price || 0,
        "",
        "",
        "",
        "",
        article.reductionPercentage,
        "",
        "",
        "",
        "",
        user.id.toString(), // skier_index
        amount || "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
      ]),
    },
    LONGUEUR_TABLE_EBILLETS: 7,
    TABLE_EBILLETS: {
      string: articles.flatMap((article) => [
        article.reference,
        user.lastName || "Inconnu",
        user.firstName || "Inconnu",
        todayDate,
        user.birthDate || "01/01/1970",
        "",
        user.id.toString(), // skier_index
      ]),
    },
    LONGUEUR_TABLE_FRAIS_GESTION: 28,
    TABLE_FRAIS_GESTION: {
      string: [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
      ],
    },
  };
};
