import { CouponIncluded } from "../../server/api/routers/coupon";
import { getPayloadClient } from "../../payload/payloadClient";
import { sendPushNotification } from "../../utils/sendPushNotification";
import { getBaseUrl, dateDiffInDays } from "../../utils/tools";

const slug = "reminder-offer-activated";

export async function sendReminderOfferActivated() {
  console.log(`[${slug}] - Start sending notifications`);

  let nbOfNotificationsSent = 0;
  let nbOfNotificationsInDb = 0;

  try {
    const payload = await getPayloadClient({ seed: false });

    const date2DaysAgo = new Date(new Date().setDate(new Date().getDate() - 2));

    const offersActivated = await payload.find({
      collection: "coupons",
      pagination: false,
      depth: 1,
      where: {
        used: {
          equals: false,
        },
        assignUserAt: {
          greater_than_equal: `${
            date2DaysAgo.toISOString().split("T")[0]
          }T00:00:00`,
          less_than_equal: `${
            date2DaysAgo.toISOString().split("T")[0]
          }T23:59:59`,
        },
        "user.notification_status": {
          equals: "enabled",
          exists: true,
        },
        "user.notification_subscription": {
          exists: true,
        },
      },
    });

    if (offersActivated.docs.length === 0) {
      console.log(`[${slug}] - No offers activated 2 days ago found`);
      return;
    }

    const users = new Map<number, CouponIncluded[]>();

    for (const offerActivated of offersActivated.docs as CouponIncluded[]) {
      if (!users.has(offerActivated.user.id))
        users.set(offerActivated.user.id, []);

      users.get(offerActivated.user.id)?.push(offerActivated);
    }

    for (const [user_id, offersActivated] of users.entries()) {
      const user = offersActivated[0].user;

      const title =
        offersActivated.length > 1
          ? "Vos offres vous attendent !"
          : "Votre offre vous attend !";

      const message =
        offersActivated.length > 1
          ? `👉 ${offersActivated.length} offres vous attendent, utilisez-les quand vous voulez. Ne l’oubliez pas 😶`
          : `👉 L’offre ${offersActivated[0].offer.partner.name} vous attend, utilisez-la quand vous voulez. Ne l’oubliez pas 😶`;

      const { notificationSent, notificationInDb } = await sendPushNotification(
        {
          sub: user.notification_subscription,
          payload,
          userId: user_id,
          payloadNotification: {
            title,
            message,
            url: `${getBaseUrl()}/dashboard/wallet`,
            slug,
          },
        }
      );

      if (notificationSent) nbOfNotificationsSent++;
      if (notificationInDb) nbOfNotificationsInDb++;
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
