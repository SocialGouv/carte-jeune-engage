import "ignore-styles";
import "dotenv/config";

import { sendNewOfferAvailable } from "./newOfferAvailable";
import { sendReminderAuchan } from "./reminderAuchan";
import { sendReminderOfferUserPreferences } from "./reminderOfferUserPreferences";
import { sendReminderOfferActivated } from "./reminderOfferActivated";

export const initNotifications = async () => {
  try {
    console.log(
      "[INIT] - Begin sending notifications",
      new Date().toLocaleString("fr-FR")
    );
    await sendNewOfferAvailable();
    await sendReminderAuchan();
    await sendReminderOfferUserPreferences();
    await sendReminderOfferActivated();
    console.log(
      "[INIT] - End sending notifications",
      new Date().toLocaleString("fr-FR")
    );
  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
};

initNotifications();
