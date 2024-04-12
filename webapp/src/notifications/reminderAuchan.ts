import { getBaseUrl, isNbOfDaysToEndOfTheMonth } from "~/utils/tools";
import { getPayloadClient } from "../payload/payloadClient";
import { sendPushNotification } from "../utils/sendPushNotification";
import { Offer, Partner } from "~/payload/payload-types";

const slug = "reminder-auchan";

export async function sendReminderAuchan() {
  console.log(`[${slug}] - Start sending notifications`);

  let nbOfNotificationsSent = 0;
  let nbOfNotificationsInDb = 0;

  if (!isNbOfDaysToEndOfTheMonth(10)) {
    console.log(`[${slug}] - Not 10 days before the end of the month`);
    return;
  }

  try {
    const payload = await getPayloadClient({ seed: false });

    const users = await payload.find({
      collection: "users",
      pagination: false,
      depth: 0,
      where: {
        notification_status: {
          equals: "enabled",
          exists: true,
        },
        notification_subscription: {
          exists: true,
        },
      },
    });

    const partners = await payload.find({
      collection: "partners",
      limit: 1,
      where: {
        name: {
          equals: "Auchan",
        },
      },
    });

    const auchanPartner = partners.docs[0] as Partner;

    if (!auchanPartner) {
      console.log(`[${slug}] - Ending (Auchan partner not found)`);
      return;
    }

    const offers = await payload.find({
      collection: "offers",
      limit: 1,
      where: {
        partner: {
          equals: auchanPartner.id,
        },
        validityTo: {
          // start day of the month
          greater_than_equal: new Date(
            new Date().getFullYear(),
            new Date().getMonth(),
            1
          ).toISOString(),
        },
        validityFrom: {
          less_than_equal: new Date(
            new Date().getFullYear(),
            new Date().getMonth() + 1,
            0
          ).toISOString(),
        },
      },
    });

    const auchanCurrentOffer = offers.docs[0] as Offer;

    if (!auchanCurrentOffer) {
      console.log(`[${slug}] - Ending (Auchan offer not found)`);
      return;
    }

    for (const user of users.docs) {
      const { notificationSent, notificationInDb } = await sendPushNotification(
        {
          sub: user.notification_subscription,
          payload,
          userId: user.id,
          payloadNotification: {
            title: "🗓️ J-10 pour l’offre Auchan",
            message:
              "10% chez Auchan Sarcelles expire dans 10j. Activez l’offre et rendez-vous au Auchan de Sarcelles pour en profiter.",
            slug,
            url: `${getBaseUrl()}/dashboard/offer/${auchanCurrentOffer.id}`,
          },
        }
      );

      if (notificationSent) nbOfNotificationsSent++;
      if (notificationInDb) nbOfNotificationsInDb++;
    }

    console.log(`[${slug}] - Summary`, {
      nbOfNotificationsSent,
      nbOfNotificationsInDb,
      slug,
    });
  } catch (e) {
    console.log({
      error: `[${slug}] - Error on condition to send notification`,
    });
    console.error(e);
  }
}
