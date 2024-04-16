import { CouponIncluded } from "../server/api/routers/coupon";
import { getPayloadClient } from "../payload/payloadClient";
import { sendPushNotification } from "../utils/sendPushNotification";
import { getBaseUrl, dateDiffInDays } from "../utils/tools";

const slug = "reminder-offer-activated";

export async function sendReminderOfferActivated() {
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
      const offersActivated = await payload.find({
        collection: "coupons",
        depth: 1,
        where: {
          user: {
            equals: user.id,
          },
          used: {
            equals: false,
          },
        },
      });

      for (const offerActivated of offersActivated.docs as CouponIncluded[]) {
        if (!offerActivated.assignUserAt) return;
        const couponUserAssignAt = new Date(offerActivated.assignUserAt);
        const currentDate = new Date();
        const diffDays = dateDiffInDays(couponUserAssignAt, currentDate);

        if (diffDays === 2) {
          const { notificationSent, notificationInDb } =
            await sendPushNotification({
              sub: user.notification_subscription,
              payload,
              userId: user.id,
              payloadNotification: {
                title: "Votre offre vous attend !",
                message: `👉 L’offre ${offerActivated.offer.title} vous attend, utilisez-la quand vous voulez. Ne l’oubliez pas 😶`,
                url: `${getBaseUrl()}/dashboard/offer/${
                  offerActivated.offer.id
                }`,
                slug,
              },
            });

          if (notificationSent) nbOfNotificationsSent++;
          if (notificationInDb) nbOfNotificationsInDb++;
        }
      }
    }

    if (nbOfNotificationsSent > 0 || nbOfNotificationsInDb > 0) {
      console.log(`[${slug}] - Summary`, {
        nbOfNotificationsSent,
        nbOfNotificationsInDb,
        slug,
      });
    }
  } catch (e) {
    console.log({
      error: `[${slug}] - Error on condition to send notification`,
    });
    console.error(e);
  }
}
