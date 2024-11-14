import { formatDateTime, getBaseUrl } from "./tools";
import { Order, User } from "~/payload/payload-types";

export const getHtmlLoginByEmail = (user: User, userAuthToken: string) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          margin: 0;
          padding: 0;
          display: flex;
          font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif;
          justify-content: center;
          margin-top: 2rem;
        }

        .container {
          background-color: white;
          padding: 2rem;
          width: 100%;
          max-width: 28rem;
          margin: 2rem;
        }

        .logo-container {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .logo {
          height: 3rem;
          object-fit: contain;
        }

        h1 {
          text-align: center;
          font-size: 1.5rem;
          font-weight: 800;
          color: #111827;
          margin-bottom: 1.5rem;
        }

        .auth-code-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: #F2F2F8;
          margin: 0 15%;
          border-radius: 1.25rem;
        }

        .auth-code {
          text-align: center;
          font-size: 1.5rem;
          font-weight: 800;
          color: #20202C;
          letter-spacing: 1rem;
          margin-bottom: 1.5rem;
          margin-left: 1rem;
        }

        p {
          text-align: center;
          color: #20202C;
          margin-bottom: 1rem;
          line-height: 1.5;
        }
      </style>
    </head>
      <body>
        <div class="container">
          <div class="logo-container">
            <img src="${getBaseUrl()}/images/landing/ministere-travail.png" alt="Ministère" class="logo">
            <img src="${getBaseUrl()}/images/cje-logo.png" alt="Jeune Engagé" class="logo logo-cje">
          </div>
          
          <h1>Votre code de connexion</h1>
          
          <div class="auth-code-wrapper">
            <p class="auth-code">${userAuthToken}</p>
          </div>

          <p>${userAuthToken} -  c’est votre code pour vous connecter à votre compte carte “jeune engagé”</p>

          <p>
            Connectez-vous à votre compte carte “jeune engagé” en collant le code ci-dessus dans votre application maintenant.
            <br/>
            Ce code est valable pendant 1h.
          </p>
        </div>
      </body>
    </html>
  `;
};

export const getHtmlSignalOrder = (user: User, order: Order) => {
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

					<p class="bottom-container">
						<b>Numéro de commande :</b> ${order.number}<br/>
						<b>Date de votre demande :</b> ${formatDateTime(now)}
					</p> 
        </div>
      </body>
    </html>
  `;
};
