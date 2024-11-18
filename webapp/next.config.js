// next.config.js
const {
  PHASE_DEVELOPMENT_SERVER,
  PHASE_PRODUCTION_BUILD,
} = require("next/constants");

const path = require("path");
const { withPayload } = require("@payloadcms/next-payload");
const { withSentryConfig } = require("@sentry/nextjs");

const { version } = require("./package.json");

const nextOptions = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname:
          `https://${process.env.S3_BUCKET_NAME || ""}.${(process.env.S3_ENDPOINT || "https://s3.endpoint.loc").replace("https://", "")}`.replace(
            /^(https?:\/\/)/,
            ""
          ),
        port: "",
        pathname: `/${process.env.S3_BUCKET_NAME}/**`,
      },
    ],
    minimumCacheTTL: 604800,
  },
  env: {
    NEXT_PUBLIC_CURRENT_PACKAGE_VERSION: version,
  },
  transpilePackages: ["@choc-ui/chakra-autocomplete"],
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

module.exports = async (phase) => {
  if (phase === PHASE_DEVELOPMENT_SERVER || phase === PHASE_PRODUCTION_BUILD) {
    const withSerwist = (await import("@serwist/next")).default({
      swSrc: "worker/index.ts",
      swDest: "public/sw.js",
    });

    return withPayload(
      withSerwist(
        withSentryConfig(nextOptions, sentryWebpackPluginOptions, sentryOptions)
      ),
      payloadOptions
    );
  }

  return withPayload(
    withSentryConfig(nextOptions, sentryWebpackPluginOptions, sentryOptions),
    payloadOptions
  );
};
