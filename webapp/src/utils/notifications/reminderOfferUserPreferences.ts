import { OfferIncluded } from "~/server/api/routers/offer";
import { getPayloadClient } from "../../payload/payloadClient";

export async function sendReminderOfferUserPreferencesNotification({}) {
  const payload = await getPayloadClient({ seed: false });

  const users = await payload.find({
    collection: "users",
    pagination: false,
    depth: 2,
    where: {
      notifaction_status: {
        equals: true,
        exists: true,
      },
      notifaction_subscription: {
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
        categories: {
          in: user.preferences,
        },
      },
    });

    if (offers.docs.length === 0) return;

    const offer = offers.docs[
      Math.floor(Math.random() * offers.docs.length)
    ] as OfferIncluded;

    await fetch(`/api/notification`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sub: user.notification_subscription,
        title: `${offer.partner.name} offre une réduction ${offer?.title} disponible sur l'appli 👀`,
        message: `${offer.partner.name} offre une réduction ${offer?.title} disponible sur l'appli 👀`,
      }),
    });
  }
}
