// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

if (process.env.NODE_ENV !== "development" && process.env.NEXT_PUBLIC_ENV_APP) {
  Sentry.init({
    dsn: "https://a225262302b847f2baff3c42466efd6b@sentry.fabrique.social.gouv.fr/105",
    environment: process.env.NEXT_PUBLIC_ENV_APP,

    // Adjust this value in production, or use tracesSampler for greater control
    tracesSampleRate: 1,

    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: false,
  });
}
