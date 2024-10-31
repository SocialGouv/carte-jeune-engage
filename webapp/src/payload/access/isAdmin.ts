import { Access } from "payload/config";
import { User } from "../payload-types";

export const isAdmin: Access<any, User> = ({ req: { user } }) => {
  return Boolean(user) && user.collection === "admins";
};

export const isAdminOrSelf: Access<any, User> = ({ req: { user } }) => {
  if (user) {
    if (user.collection === "admins") return true;

    return {
      id: {
        equals: user.id,
      },
    };
  }

  return false;
};
