import { OfferIncluded } from "~/server/api/routers/offer";
import {
  formatDateTime,
  formatDateToDDMMYYYY,
  formatter2Digits,
  getBaseUrl,
} from "./tools";
import { Order, User } from "~/payload/payload-types";

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

export const getHtmlRecapOrder = (
  user: User,
  order: Order,
  offer: OfferIncluded
) => {
  const total_amount =
    order.articles?.reduce(
      (acc, article) =>
        acc + article.article_montant * article.article_quantity,
      0
    ) || 0;

  const total_amount_discounted =
    order.articles?.reduce(
      (acc, article) =>
        acc + article.article_montant_discounted * article.article_quantity,
      0
    ) || 0;

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
          .image-wallet {
            display: block;
            width: 250px;
            height: 250px;
            margin: 20px auto;
          }
          h1 {
              font-size: 1.8em;
              margin: 10px 0;
              font-weight: bold;
          }
          .button {
              background-color: #4285f4;
              color: white;
              padding: 15px 30px;
              border-radius: 18px;
              text-decoration: none;
              display: inline-block;
              margin: 20px 0;
              font-weight: 500;
          }
          .button::after {
              content: " →";
          }
          .summary {
              margin-top: 40px;
          }
          .summary-wrapper {
              display: flex;
              gap: 20px;
          }
          .summary-row {
              display: flex;
              justify-content: space-between;
              margin: 10px 0;
          }
          .summary-article-wrapper {
              display: flex;  
              flex-direction: column;
              gap: 0.5rem;
              width: 100%;
          }
          .summary-article {
              display: flex;
              justify-content: space-between;
              width: 100%;
          }
          .summary-title {
              font-size: 1.2em;
              font-weight: bold;
              margin: 20px 0;
          }
          .details-row {
              padding-left: 20px;
          }
          .bold {
              font-weight: 800;
              flex-shrink: 0;
          }
      </style>
      </head>
      <body>
        <div class="container">
          <div class="logo-container">
            <img src="${getBaseUrl()}/images/landing/ministere-travail.png" alt="Ministère" class="logo">
            <img src="${getBaseUrl()}/images/cje-logo.png" width={} alt="Jeune Engagé" class="logo logo-cje">
          </div>

          <span>VOTRE COMMANDE</span>
          
          <h1>Votre bon d’achat ${offer.partner.name} est arrivé ${user.firstName} !</h1>
          
          <a href="${getBaseUrl()}/dashboard/order/${order.id}" class="button">
            Récupérer mon bon d’achat
          </a>

          <img
            src="${getBaseUrl()}/images/dashboard/email-recap-order-wallet.png"
            alt="Récapitulatif image portefeuille"
            class="image-wallet"
          >

          <div class="summary">
            <div class="summary-title">RÉCAPITULATIF</div>
            <div class="summary-row">
                <span class="bold">Marque :</span>
                <span>${offer.partner.name}</span>
            </div>
            <div class="summary-row">
                <span class="bold">Total valeur bon d'achat :</span>
                <span>${total_amount}€</span>
            </div>
            <div class="summary-wrapper">
              <span class="bold">Détails :</span>
              <div class="summary-article-wrapper">
                ${order.articles?.map((article) => {
                  return `
                    <div class="summary-article">
                        <span>Bon d'achat ${article.article_montant}€</span>
                        <span>x${article.article_quantity}</span>
                    </div>
                  `;
                })}
              </div>
            </div>
            <div class="summary-row">
                <span class="bold">Montant réglé :</span>
                <span>${formatter2Digits.format(total_amount_discounted)}€</span>
            </div>
            <div class="summary-row">
                <span class="bold">Économies réalisées</span>
                <span>${formatter2Digits.format(total_amount - total_amount_discounted)}€</span>
            </div>
            <div class="summary-row">
                <span class="bold">Date de commande :</span>
                <span>${formatDateToDDMMYYYY(order.createdAt)}</span>
            </div>
            <div class="summary-row">
                <span class="bold">Durée de validité :</span>
                <span>Voir sur le PDF</span>
            </div>
          </div>

          <a href="${getBaseUrl()}/dashboard/order/${order.id}" class="button">
            Récupérer mon bon d’achat
          </a>
        </div>
      </body>
    </html>
  `;
};
