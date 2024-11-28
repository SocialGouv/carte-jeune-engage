// next.config.js
// import {
//   PHASE_DEVELOPMENT_SERVER,
//   PHASE_PRODUCTION_BUILD,
// } from "next/constants";
import { withPayload } from "@payloadcms/next/withPayload";
import { withSentryConfig } from "@sentry/nextjs";
import path from "path";
import { fileURLToPath } from "url";
// import { version } from "./package.json";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
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
        pathname: `/**`,
      },
    ],
    minimumCacheTTL: 604800,
  },
  experimental: {
    reactCompiler: false,
  },
  env: {
    NEXT_PUBLIC_CURRENT_PACKAGE_VERSION: "0.0.0",
  },
  transpilePackages: ["@choc-ui/chakra-autocomplete", "react-image-crop"],
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

const payloadOptions = {
  configPath: path.resolve(__dirname, "./src/payload/payload.config.ts"),
  payloadPath: path.resolve(process.cwd(), "./src/payload/payloadClient.ts"),
  adminRoute: "/admin",
};

// module.exports = async () => {
//   if (
//     process.env.NODE_ENV === "development" ||
//     process.env.NODE_ENV === "production"
//   ) {
//     const withSerwist = (await import("@serwist/next")).default({
//       swSrc: "worker/index.ts",
//       swDest: "public/sw.js",
//     });

//     return withPayload(
//       withSerwist(
//         withSentryConfig(nextOptions, sentryWebpackPluginOptions, sentryOptions)
//       ),
//       payloadOptions
//     );
//   }

//   return
// };

export default withPayload(nextOptions, payloadOptions);
