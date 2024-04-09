import { getPayloadClient } from "../payload/payloadClient";
import { sendPushNotification } from "../utils/sendPushNotification";

const slug = "reminder-auchan";

export async function sendReminderAuchan() {
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
      },
    });

    for (const user of users.docs) {
      const currentMonth = new Date().toLocaleString("fr-FR", {
        month: "long",
      });

      const { notificationSent, notificationInDb } = await sendPushNotification(
        {
          sub: user.notification_subscription,
          payload,
          userId: user.id,
          payloadNotification: {
            title: `🗓️ Plus que 10 jours pour l’offre Auchan du mois de ${currentMonth} 🛒  Il n’y a plus qu’à l’activer et rendez-vous au magasin de Sarcelles`,
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
