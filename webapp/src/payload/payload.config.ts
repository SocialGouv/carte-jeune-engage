import path from "path";
import { buildConfig } from "payload/config";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { slateEditor } from "@payloadcms/richtext-slate";
import { webpackBundler } from "@payloadcms/bundler-webpack";
import { cloudStorage } from "@payloadcms/plugin-cloud-storage";
import { s3Adapter } from "@payloadcms/plugin-cloud-storage/s3";

import { QuickAccess } from "./globals/QuickAccess";

import { Admins } from "./collections/Admin";
import { Users } from "./collections/User";
import { Media } from "./collections/Media";
import { Categories } from "./collections/Categorie";
import { Partners } from "./collections/Partner";
import { Offers } from "./collections/Offer";
import { Coupons } from "./collections/Coupon";
import { Savings } from "./collections/Saving";

const adapter = s3Adapter({
  config: {
    endpoint: process.env.S3_ENDPOINT,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID ?? "",
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "",
    },
    region: process.env.S3_REGION ?? "",
  },
  bucket: process.env.S3_BUCKET_NAME ?? "",
});

export default buildConfig({
  db: postgresAdapter({
    migrationDir: path.resolve(__dirname, "./migrations"),
    pool: {
      connectionString:
        process.env.NODE_ENV !== "production"
          ? process.env.DATABASE_URL
          : `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}?sslmode=disable`,
    },
  }),
  plugins: [
    cloudStorage({
      collections: {
        media: {
          adapter: adapter,
          disableLocalStorage: true,
          disablePayloadAccessControl: true,
          generateFileURL: (file) => `/api/image?filename=${file.filename}`,
        },
      },
    }),
  ],
  editor: slateEditor({}),
  admin: {
    bundler: webpackBundler(),
    user: "admins",
  },
  collections: [
    Admins,
    Users,
    Media,
    Categories,
    Partners,
    Offers,
    Coupons,
    Savings,
  ],
  localization: {
    locales: ["fr"],
    defaultLocale: "fr",
  },
  globals: [QuickAccess],
  typescript: {
    outputFile: path.resolve(__dirname, "./payload-types.ts"),
  },
});
