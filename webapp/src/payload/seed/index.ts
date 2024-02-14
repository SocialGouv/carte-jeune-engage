import "ignore-styles";
import "dotenv/config";
import { getPayloadClient } from "../payloadClient";

import { seedCategories } from "./categories";
import { seedPartners } from "./partners";
import { seedOffers } from "./offers";

export const seedData = async () => {
  try {
    const payload = await getPayloadClient({
      seed: true,
    });

    await payload.create({
      collection: "admins",
      data: {
        email: "admin@test.loc",
        firstName: "Admin",
        lastName: "Test",
        password: "admin123",
      },
    });

    await payload.create({
      collection: "users",
      data: {
        email: "user@test.loc",
        firstName: "User",
        lastName: "Test",
        phone_number: "0666666666",
        password: "user123",
      },
    });

    await payload.create({
      collection: "supervisors",
      data: {
        email: "referent@test.loc",
        password: "referent123",
      },
    });

    await seedCategories(payload);

    await seedPartners(payload);

    await seedOffers(payload);
  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
};

seedData();
