import { formatDateTime, getBaseUrl } from "./tools";
import { User } from "~/payload/payload-types";

export const getHtmlLoginByEmail = (user: User, userAuthToken: string) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
           	font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif;
            line-height: 1.6;
            color: #333333;
            text-align: center;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 32px;
						text-align: center;
          }
          .logo-container {
            margin-bottom: 48px;
          }
          .logo {
            height: 48px;
						width: 48px;
            margin: 0 8px;
          }
					.logo-cje {
						width: 80px;
					}
          h1 {
            font-size: 28px;
            font-weight: bolder;
            margin-bottom: 30px;
          }
          .cta-button {
            display: inline-block;
            background-color: #1698FC;
            color: white;
						font-weight: bold;
            padding: 16px 32px;
            text-decoration: none;
            border-radius: 9999px;
            margin: 20px 0 20px;
            font-size: 18px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo-container">
            <img src="${getBaseUrl()}/images/landing/ministere-travail.png" alt="Ministère" class="logo">
            <img src="${getBaseUrl()}/images/cje-logo.png" alt="Jeune Engagé" class="logo logo-cje">
          </div>
          
          <h1>${user?.firstName ? ` ${user.firstName}` : ""}, vos offres vous attendent !</h1>
          
          <p>Pour vous connecter, cliquez simplement sur le lien. <br/> Plus besoin de mot de passe.</p>
          
          <a href="${getBaseUrl()}/verifyLoginEmail?token=${userAuthToken}" class="cta-button">
            C'est ici pour vous connecter
          </a>

					<p>L'équipe Carte "jeune engagé"</p>
        </div>
      </body>
    </html>
  `;
};

export const getHtmlSignalOrder = (user: User) => {
  const now = new Date();
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
           	font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif;
            line-height: 1.6;
            color: #333333;
            text-align: center;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 32px;
						text-align: center;
          }
          .logo-container {
            margin-bottom: 48px;
          }
          .logo {
            height: 48px;
						width: 48px;
            margin: 0 8px;
          }
					.logo-cje {
						width: 80px;
					}
          h1 {
            font-size: 28px;
            font-weight: bolder;
            margin-bottom: 30px;
          }
					hr {
						border-color: #E2E8F0;
						border-width: 1px;
					}
					.bottom-container {
						font-size: 14px;
					}
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo-container">
            <img src="${getBaseUrl()}/images/landing/ministere-travail.png" alt="Ministère" class="logo">
            <img src="${getBaseUrl()}/images/cje-logo.png" width={} alt="Jeune Engagé" class="logo logo-cje">
          </div>
          
          <h1>Nous avons bien reçu votre demande d’aide ${user.firstName}</h1>
          
          <p>Vérifiez vos mails nous allons bientôt vous écrire pour trouver la solution à votre problème.</p>

					<p>L'équipe Carte "jeune engagé"</p>

					<hr/>

					<p class="bottom-container"><b>Date de votre demande : ${formatDateTime(now)}</b> 
        </div>
      </body>
    </html>
  `;
};
