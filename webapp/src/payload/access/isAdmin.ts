import { Access } from "payload/config";
import { User } from "../payload-types";

export const isAdmin: Access<any, User> = ({ req: { user } }) => {
  return Boolean(user) && user.collection === "admins";
};
