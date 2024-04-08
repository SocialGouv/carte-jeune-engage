import { OfferIncluded } from "~/server/api/routers/offer";
import { getPayloadClient } from "../../payload/payloadClient";

export async function sendNewOfferAvailable() {
  const payload = await getPayloadClient({ seed: false });

  const todayOffers = await payload.find({
    collection: "offers",
    pagination: false,
    depth: 1,
    where: {
      createdAt: {
        greater_than_equal: new Date().toISOString().split("T")[0],
      },
    },
  });

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
    },
  });

  if (todayOffers.docs.length === 0) return;

  for (const user of users.docs) {
    for (const offer of todayOffers.docs as OfferIncluded[]) {
      await fetch(`/api/notification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sub: user.notification_subscription,
          title: `🎁 Nouvelle offre sur l’appli ! ${offer.partner.name} ${offer.title}`,
        }),
      });
    }
  }
}
