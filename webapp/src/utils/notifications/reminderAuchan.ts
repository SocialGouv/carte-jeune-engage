import { getPayloadClient } from "../../payload/payloadClient";
import { Partner } from "~/payload/payload-types";

export async function sendReminderAuchan() {
  const payload = await getPayloadClient({ seed: false });

  // const auchanPartner = await payload.find({
  //   collection: "partners",
  //   pagination: false,
  //   depth: 0,
  //   where: {
  //     name: {
  //       equals: "Auchan",
  //     },
  //   },
  // });

  // const tmpAuchanPartner = auchanPartner.docs[0] as Partner;

  // const currentAuchanOffer = await payload.find({
  //   collection: "offers",
  //   pagination: false,
  //   depth: 0,
  //   where: {
  //     partner: {
  //       equals: tmpAuchanPartner.id,
  //     },
  //   },
  // });

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

  for (const user of users.docs) {
    const currentMonth = new Date().toLocaleString("fr-FR", { month: "long" });

    await fetch(`/api/notification`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sub: user.notification_subscription,
        title: `🗓️ Plus que 10 jours pour l’offre Auchan du mois de ${currentMonth} 🛒  Il n’y a plus qu’à l’activer et rendez-vous au magasin de Sarcelles`,
      }),
    });
  }
}
