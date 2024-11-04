var crypto = require("crypto");

export const obiz_signature = crypto
  .createHash("sha512")
  .update(`${process.env.OBIZ_PARTNER_ID}+${process.env.OBIZ_PARTNER_SECRET}`)
  .digest("hex") as string;

export const createOrderPayload = async ({ user_id }: { user_id: number }) => {
  return {
    CE_ID: "",
  };
};
