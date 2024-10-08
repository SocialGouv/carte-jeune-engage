import { getBaseUrl } from "./tools";
import { User } from "~/payload/payload-types";

export const getHtmlLoginByEmail = (user: User, userAuthToken: string) => {
  return `
    <p>Bonjour${user?.firstName ? ` ${user.firstName}` : ""},</p>
    <h1>Vos offres vous attendent !</h1>
    <p>
      Pour vous connecter, cliquez
      <br />
      simplement sur le lien.
      <br />
      Plus besoin de mot de passe.
    </p>
    <a href="${getBaseUrl()}/verifyLoginEmail?token=${userAuthToken}">Rendez-vous ici</a>
    <p>Carte "jeune engagé"</p>
  `;
};
