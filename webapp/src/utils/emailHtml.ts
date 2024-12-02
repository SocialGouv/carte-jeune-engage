import { OfferIncluded } from "~/server/api/routers/offer";
import {
  formatDateTime,
  formatDateToDDMMYYYY,
  formatter2Digits,
  getBaseUrl,
} from "./tools";
import { Coupon, Order, User } from "~/payload/payload-types";
import { CouponIncluded } from "~/server/api/routers/coupon";

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
					width: 100%;
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

export const getHtmlRecapOrderPaid = (
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
              margin: 20px 0 10px 0;
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
					.button:visited {
						color: white !important;
					}
          .summary {
              margin-top: 40px;
          }
					.summary table {
						text-align: left;
						width: 100%;
					}
					.summary table tr td:last-of-type {
						text-align: right;
					}
					.total-row > td {
						padding-bottom: 20px;
					}
					.total-paid-row > td {
						padding-top: 20px;
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
					.blue {
						color: #4285f4;
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
          
          <h1>Votre bon d’achat <span class="blue">${offer.partner.name}</span> va bientôt arriver...</h1>
          
          <p>
						Les bon d’achats peuvent prendre jusqu’à 24h maximum pour arriver dans votre appli. Dès que votre bon d’achat est disponible nous vous tenons au courant.
					</p>

          <div class="summary">
            <div class="summary-title">RÉCAPITULATIF</div>
						<table>
							<tr>
								<td><span class="bold">Marque :</span></td>
								<td><span>${offer.partner.name}</span></td>
							</tr>
							<tr class="total-row">
								<td><span class="bold">Total valeur bon d'achat :</span></td>
								<td><span>${total_amount}€</span></td>
							</tr>
							<tr>
								<td><span class="bold">Détails :</span></td>
								<td></td>
							</tr>
							${order.articles?.map((article) => {
                return `
											<tr>
													<td><span>Bon d'achat ${article.article_montant}€</span></td><td><span>x${article.article_quantity}</span></td>
											</tr>
										`;
              })}
							<tr class="total-paid-row">
								<td><span class="bold">Montant réglé :</span></td>
								<td><span>${formatter2Digits.format(total_amount_discounted)}€</span></td>
							</tr>
							<tr>
								<td><span class="bold">Économies réalisées</span></td>
								<td><span>${formatter2Digits.format(total_amount - total_amount_discounted)}€</span></td>
							</tr>
							<tr>
								<td><span class="bold">Date de commande :</span></td>
								<td><span>${formatDateToDDMMYYYY(order.createdAt)}</span></td>
							</tr>
							<tr>
								<td><span class="bold">Durée de validité :</span></td>
								<td><span>Voir sur le PDF</span></td>
							</tr>
						</table>
          </div>
        </div>
      </body>
    </html>
  `;
};

export const getHtmlRecapOrderDelivered = (
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
              margin: 20px 0 10px 0;
              font-weight: bold;
          }
          .button {
              background-color: #4285f4;
              color: white !important;
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
					.button:visited {
						color: white !important;
					}
          .summary {
              margin-top: 40px;
          }
					.summary table {
						text-align: left;
						width: 100%;
					}
					.summary table tr td:last-of-type {
						text-align: right;
					}
					.total-row > td {
						padding-bottom: 20px;
					}
					.total-paid-row > td {
						padding-top: 20px;
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
					.blue {
						color: #4285f4;
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
          
          <h1>Votre bon d’achat <span class="blue">${offer.partner.name}</span> est arrivé ${user.firstName} !</h1>
          
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
            <table>
							<tr>
								<td><span class="bold">Marque :</span></td>
								<td><span>${offer.partner.name}</span></td>
							</tr>
							<tr class="total-row">
								<td><span class="bold">Total valeur bon d'achat :</span></td>
								<td><span>${total_amount}€</span></td>
							</tr>
							<tr>
								<td><span class="bold">Détails :</span></td>
								<td></td>
							</tr>
							${order.articles?.map((article) => {
                return `
											<tr>
													<td><span>Bon d'achat ${article.article_montant}€</span></td><td><span>x${article.article_quantity}</span></td>
											</tr>
										`;
              })}
							<tr class="total-paid-row">
								<td><span class="bold">Montant réglé :</span></td>
								<td><span>${formatter2Digits.format(total_amount_discounted)}€</span></td>
							</tr>
							<tr>
								<td><span class="bold">Économies réalisées</span></td>
								<td><span>${formatter2Digits.format(total_amount - total_amount_discounted)}€</span></td>
							</tr>
							<tr>
								<td><span class="bold">Date de commande :</span></td>
								<td><span>${formatDateToDDMMYYYY(order.createdAt)}</span></td>
							</tr>
							<tr>
								<td><span class="bold">Durée de validité :</span></td>
								<td><span>Voir sur le PDF</span></td>
							</tr>
						</table>
          </div>

          <a href="${getBaseUrl()}/dashboard/order/${order.id}" class="button">
            Récupérer mon bon d’achat
          </a>
        </div>
      </body>
    </html>
  `;
};

export const getHtmlUserReminderCJEOffer = (
  user: User,
  coupons: CouponIncluded[]
) => {
  const offerTitleMaxLength = 50;
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
            padding: 10px;
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
					.bold {
						font-weight: bold;
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
					.button {
						background-color: #4285f4;
						color: white !important;
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
					.button:visited {
						color: white !important;
					}
					.coupon-box {
						display: block;
						max-width: 475px;
						border: 1px solid #E0E0EA;
						border-radius: 10px;
						padding: 0 25px;
						text-decoration: none;
						color: black !important;
						text-align: left;
						line-height: 100px;
						margin: 10px auto;
					}
					.coupon-box > div {
						display: inline-block;
					}
					.coupon-box > div.coupon-box-first {
						width: 15%;
						vertical-align: middle;
					}
					.coupon-box > div.coupon-box-second {
						width: 65%;
						padding-left: 15px;
						vertical-align: middle;
						line-height: 22px;
					}
					.coupon-box > div.coupon-box-third {
						width: 15%;
						text-align: right;
						vertical-align: middle;
						font-weight: bold;
					}
					.coupon-box img.partner-logo {
						width: 42px;
						height: 42px;
						borderRadius: 8px;
						vertical-align: middle;
					}
					.coupon-box img.arrow-icon {
						width: 25px;
						height: 25px;
						vertical-align: middle;
					}
					.offers-box {
						max-width: 400px;
						font-weight: bold;
						margin: 0 auto;
					}
					.offers-box img {
						width: 100%;
					}
					.offers-box p {
						padding: 0 20px;
					}
					.offers-box a {
						color: #1698FC;
						margin-top: 15px;
					}
					.footer {
						margin: 40px auto;
					}
					.blue {
						color: #4285f4;
					}
					.separator {
						height: 1px;
						background-color: #E0E0EA;
						margin: 40px 0;
					}
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo-container">
            <img src="${getBaseUrl()}/images/landing/ministere-travail.png" alt="Ministère" class="logo">
            <img src="${getBaseUrl()}/images/cje-logo.png" width={} alt="Jeune Engagé" class="logo logo-cje">
          </div>
          
          <span>VOS CODES DE RÉDUCTION</span>
          
          <h1>Vous avez <span class="blue">${coupons.length}</span> code${coupons.length > 1 ? "s" : ""} de réduction actif${coupons.length > 1 ? "s" : ""}</h1>
          
          <p>Il${coupons.length > 1 ? "s" : ""} vous ${coupons.length > 1 ? "attendent" : "attend"} encore dans votre carte “jeune engagé”</p>

  				<a href="${getBaseUrl()}/dashboard/wallet" class="button">
            Voir tous mes codes
          </a>

          <p>LES CODES QUE VOUS AVEZ ACTIVÉS</p>

					${coupons
            .map(
              (coupon) => `
						<a class="coupon-box" href="${getBaseUrl()}/dashboard/offer/cje/${coupon.offer.id}?offerKind=coupon">
							<div class="coupon-box-first"><img src="${coupon.offer.partner.icon.url}" class="partner-logo" /></div>
							<div class="coupon-box-second"><span class="bold">${coupon.offer.partner.name}</span><br>${coupon.offer.title.length > offerTitleMaxLength ? coupon.offer.title.substring(0, offerTitleMaxLength) + "..." : coupon.offer.title}</div>
							<div class="coupon-box-third">
								<img src="https://www.svgrepo.com/show/520912/right-arrow.svg" class="arrow-icon" />
							</div>
						</a>
					`
            )
            .join("")}

					<div class="separator"></div>

					<div class="offers-box">
						<img src="https://carte-jeune-engage-prod-app.s3.gra.io.cloud.ovh.net/public/cje-mail-catalogue.svg" />
						<p>Faites des économies à chaque dépenses sur un large choix de marques</p>
						<a href="${getBaseUrl()}/dashboard">Voir toutes les offres</a>
					</div>

					<p class="footer">L'équipe Carte "jeune engagé"</p>
        </div>
      </body>
    </html>
  `;
};
