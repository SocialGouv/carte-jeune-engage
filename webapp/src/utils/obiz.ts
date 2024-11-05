var crypto = require("crypto");

export const obiz_signature = crypto
  .createHash("sha512")
  .update(`${process.env.OBIZ_PARTNER_ID}+${process.env.OBIZ_SECRET}`)
  .digest("hex") as string;

export const createOrderPayload = () => {
  const signature = crypto
    .createHash("sha512")
    .update(
      `CARTECADEAU+${process.env.OBIZ_PARTNER_ID}+CB+test+Bureau+95150+test-cje@test.loc+Cje+Test+Taverny+${process.env.OBIZ_SECRET}`
    )
    .digest("hex") as string;

  return {
    TABLE_CE: {
      string: [
        "dcb1600d-9a0d-447e-9f84-8dc45e6c0668",
        "Numéricité",
        "Homme",
        "Nom",
        "Test",
        "",
        "",
        "",
        "test@loc.com",
        "",
        "",
        "",
        "95150",
        "Taverny",
        "",
      ],
    },
    TABLE_UTILISATEUR: {
      string: [
        "id-test-cje",
        "",
        "",
        "Cje",
        "Test",
        "0600000000",
        "0600000000",
        "",
        "test-cje@test.loc",
        "Bureau",
        "10 rue de la paix",
        "",
        "95150",
        "Taverny",
        "France",
        "12/09/2000",
      ],
    },
    TABLE_COMMANDE: {
      string: [
        "0",
        "0",
        "cb",
        "0",
        "CARTECADEAU",
        "",
        "2 rue de la societe",
        "Test",
        "10 rue de la paix",
        "Batiment A",
        "95150",
        "Taverny",
        "",
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
    SIGNATURE: signature,
  };
};
