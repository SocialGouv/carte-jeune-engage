// next.config.js
const path = require("path");
const { withPayload } = require("@payloadcms/next-payload");
const { withSentryConfig } = require("@sentry/nextjs");

const { version } = require("./package.json");

const nextOptions = {
  reactStrictMode: true,
  images: {
    domains: ["localhost"],
  },
  env: {
    NEXT_PUBLIC_CURRENT_PACKAGE_VERSION: version,
  },
};

const pwaOptions = {
  dest: "public",
  reloadOnOnline: true,
  dynamicStartUrl: true,
  register: false,
  workboxOptions: {
    maximumFileSizeToCacheInBytes: 10000000,
    disableDevLogs: true,
  },
};

const payloadOptions = {
  configPath: path.resolve(__dirname, "./src/payload/payload.config.ts"),
  payloadPath: path.resolve(process.cwd(), "./src/payload/payloadClient.ts"),
  adminRoute: "/admin",
};

const sentryWebpackPluginOptions = {
  silent: false,
  org: "incubateur",
  project: "carte-jeune-engage",
  url: "https://sentry.fabrique.social.gouv.fr/",
};

const sentryOptions = {
  widenClientFileUpload: true,
  transpileClientSDK: true,
  tunnelRoute: "/monitoring",
  hideSourceMaps: true,
  disableLogger: true,
  automaticVercelMonitors: true,
};

const withPWA = require("@ducanh2912/next-pwa").default(pwaOptions);

module.exports = withPayload(
  withPWA(
    withSentryConfig(nextOptions, sentryWebpackPluginOptions, sentryOptions)
  ),
  payloadOptions
);
