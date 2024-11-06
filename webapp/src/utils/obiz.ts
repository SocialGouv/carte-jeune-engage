import { User } from "~/payload/payload-types";
import { extractAddressInformations } from "./tools";

var crypto = require("crypto");

export const obiz_signature = crypto
  .createHash("sha512")
  .update(`${process.env.OBIZ_PARTNER_ID}+${process.env.OBIZ_SECRET}`)
  .digest("hex") as string;

export const createOrderPayload = (
  user: User,
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
        "", // url_retour_ok
        "", // url_retour_ko
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
