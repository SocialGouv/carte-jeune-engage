import { OfferIncluded } from "../server/api/routers/offer";
import { getPayloadClient } from "../payload/payloadClient";
import { sendPushNotification } from "../utils/sendPushNotification";
import { getBaseUrl, payloadWhereOfferIsValid } from "../utils/tools";

const slug = "reminder-offer-user-preferences";

export async function sendReminderOfferUserPreferences() {
	console.log(`[${slug}] - Start sending notifications`);

	let nbOfNotificationsSent = 0;
	let nbOfNotificationsInDb = 0;

	// Only send notification on Wednesday
	// const today = new Date();
	// if (today.getDay() !== 3) {
	//   console.log(`[${slug}] - Not Wednesday`);
	//   return;
	// }

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
			let offers = await payload.find({
				collection: "offers",
				pagination: false,
				depth: 1,
				where: {
					category: {
						in: user.preferences,
					},
					...payloadWhereOfferIsValid(),
				},
			});

			await Promise.all(
				offers.docs.map(async (offer) => {
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

					const userCoupons = await payload.find({
						collection: "coupons",
						limit: 1,
						where: {
							offer: {
								equals: offer.id,
							},
							user: {
								equals: user.id,
							},
							used: {
								equals: false,
							},
						},
					});

					return offerCoupons.docs.length === 0 || userCoupons.docs.length > 0;
				})
			).then((results) => {
				offers.docs = offers.docs.filter((_, index) => results[index]);
			});

			if (offers.docs.length === 0) {
				console.log(`[${slug}] - No offers available`);
				return;
			}

			const offer = offers.docs[
				Math.floor(Math.random() * offers.docs.length)
			] as OfferIncluded;

			const { notificationSent, notificationInDb } = await sendPushNotification(
				{
					sub: user.notification_subscription,
					payload,
					userId: user.id,
					payloadNotification: {
						title: `${offer.partner.name} fait une offre 👀`,
						message: `Une réduction ${offer.title} disponible sur l’appli carte “jeune engagé”`,
						url: `${getBaseUrl()}/dashboard/offer/${offer.source}/${offer.id}`,
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
