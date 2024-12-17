import "ignore-styles";
import "dotenv/config";
import getPayloadClient from "../../payload/payloadClient";
import { getHtmlUserReminderCJEOffer } from "../../utils/emailHtml";
import { CouponIncluded } from "../../server/api/routers/coupon";

const BATCH_SIZE = 50;

async function processBatch(users: any[], payload: any) {
  const emailPromises = [];
  let emailsSent = 0;

  for (const user of users) {
    const coupons = await payload.find({
      collection: "coupons",
      where: {
        user: { equals: user.id },
        used: { not_equals: true },
      },
      depth: 3,
      limit: 10,
    });

    if (coupons.docs.length) {
      const userCoupons = coupons.docs as CouponIncluded[];
      console.log(
        `[${user.userEmail} (${user.phone_number})] - Sending reminders with ${userCoupons.length} coupons to use`
      );
      emailPromises.push(
        payload
          .sendEmail({
            from: process.env.SMTP_FROM_ADDRESS,
            to: user.userEmail,
            subject: `${userCoupons.length} code${userCoupons.length > 1 ? "s" : ""} promo${userCoupons.length > 1 ? "s" : ""} vous ${userCoupons.length > 1 ? "attendent" : "attend"} sur la carte "jeune engagé"`,
            html: getHtmlUserReminderCJEOffer(user, userCoupons),
          })
          .then(() => {
            emailsSent++;
            return null;
          })
          .catch((error: any) => {
            console.error(`Failed to send email to ${user.userEmail}:`, error);
            return null;
          })
      );
    }
  }

  await Promise.all(emailPromises);
  return emailsSent;
}

export const initReminders = async () => {
  const startTime = Date.now();
  let emailsSent = 0;
  let errorCount = 0;

  try {
    const payload = await getPayloadClient({ seed: false });

    console.log(
      "[INIT] - Begin sending reminder emails",
      new Date().toLocaleString("fr-FR")
    );

    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const users = await payload.find({
        collection: "users",
        where: {
          firstName: { exists: true },
        },
        sort: "createdAt",
        limit: BATCH_SIZE,
        page: page,
      });

      if (users.docs.length === 0) {
        hasMore = false;
        break;
      }

      const batchEmailsSent = await processBatch(users.docs, payload);
      emailsSent += batchEmailsSent;

      page++;
    }
  } catch (e) {
    errorCount++;
    console.error("Error in initReminders:", e);
  } finally {
    const duration = (Date.now() - startTime) / 1000;
    console.log(
      `[COMPLETE] - Reminder emails sent - Time: ${duration}s - Emails sent: ${emailsSent} - Errors: ${errorCount}`
    );
    process.exit();
  }
};

initReminders();
