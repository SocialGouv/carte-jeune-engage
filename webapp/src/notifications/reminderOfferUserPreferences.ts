import { OfferIncluded } from "~/server/api/routers/offer";
import { getPayloadClient } from "../payload/payloadClient";
import { sendPushNotification } from "../utils/sendPushNotification";

const slug = "reminder-offer-user-preferences";

export async function sendReminderOfferUserPreferences() {
  console.log(`[${slug}] - Start sending notifications`);

  let nbOfNotificationsSent = 0;
  let nbOfNotificationsInDb = 0;

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
        preferences: {
          exists: true,
        },
      },
    });

    for (const user of users.docs) {
      const offers = await payload.find({
        collection: "offers",
        pagination: false,
        depth: 1,
        where: {
          category: {
            in: user.preferences,
          },
        },
      });

      if (offers.docs.length === 0) return;

      const offer = offers.docs[
        Math.floor(Math.random() * offers.docs.length)
      ] as OfferIncluded;

      const { notificationSent, notificationInDb } = await sendPushNotification(
        {
          sub: user.notification_subscription,
          payload,
          userId: user.id,
          payloadNotification: {
            title: `${offer.partner.name} offre une réduction ${offer?.title} disponible sur l'appli 👀`,
            slug,
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
