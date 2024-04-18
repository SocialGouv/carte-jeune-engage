import { OfferIncluded } from "../server/api/routers/offer";
import { getPayloadClient } from "../payload/payloadClient";
import { sendPushNotification } from "../utils/sendPushNotification";
import { getBaseUrl } from "../utils/tools";

const slug = "new-offer-available";

export async function sendNewOfferAvailable() {
  console.log(`[${slug}] - Start sending notifications`);

  let nbOfNotificationsSent = 0;
  let nbOfNotificationsInDb = 0;

  try {
    const payload = await getPayloadClient({ seed: false });

    const currentDate = new Date();

    let todayOffers = await payload.find({
      collection: "offers",
      pagination: false,
      depth: 1,
      where: {
        validityFrom: {
          greater_than_equal: currentDate.toISOString().split("T")[0],
        },
      },
    });

    await Promise.all(
      todayOffers.docs.map(async (offer) => {
        const offerCoupons = await payload.find({
          collection: "coupons",
          limit: 1,
          where: {
            offer: {
              equals: offer.id,
            },
            user: {
              exists: false,
            },
            used: {
              equals: false,
            },
          },
        });

        if (offerCoupons.docs.length === 0) {
          todayOffers.docs = todayOffers.docs.filter((o) => o.id !== offer.id);
        }
      })
    );

    if (todayOffers.docs.length === 0) {
      console.log(`[${slug}] - Ending (No new offers today)`);
      return;
    }

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
      for (const offer of todayOffers.docs as OfferIncluded[]) {
        const { notificationSent, notificationInDb } =
          await sendPushNotification({
            sub: user.notification_subscription,
            payload,
            userId: user.id,
            offerId: offer.id,
            payloadNotification: {
              title: "🎁 Nouvelle offre sur l’appli !",
              message: `${offer.partner.name} ${offer?.title}, maintenant disponible sur l’appli`,
              url: `${getBaseUrl()}/dashboard/offer/${offer.id}`,
              slug,
            },
          });

        if (notificationSent) nbOfNotificationsSent++;
        if (notificationInDb) nbOfNotificationsInDb++;
      }
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
