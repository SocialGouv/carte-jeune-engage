import path from "path";
import { buildConfig } from "payload/config";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { slateEditor } from "@payloadcms/richtext-slate";
import { webpackBundler } from "@payloadcms/bundler-webpack";
import { cloudStorage } from "@payloadcms/plugin-cloud-storage";
import { s3Adapter } from "@payloadcms/plugin-cloud-storage/s3";

import { QuickAccess } from "./globals/QuickAccess";
import { LandingPartners } from "./globals/LandingPartners";
import { LandingFAQ } from "./globals/LandingFAQ";
import { NewCategory } from "./globals/NewCategory";
import { CategoriesList } from "./globals/CategoriesList";
import { TagsList } from "./globals/TagsList";

import { Admins } from "./collections/Admin";
import { ApiKeys } from "./collections/ApiKey";
import { Users } from "./collections/User";
import { Media } from "./collections/Media";
import { Categories } from "./collections/Categorie";
import { Partners } from "./collections/Partner";
import { Offers } from "./collections/Offer";
import { Coupons } from "./collections/Coupon";
import { Savings } from "./collections/Saving";
import { Supervisors } from "./collections/Supervisor";
import { Permissions } from "./collections/Permission";
import { Notifications } from "./collections/Notification";
import { Tags } from "./collections/Tag";
import { SearchRequests } from "./collections/SearchRequest";
import { EmailAuthTokens } from "./collections/EmailAuthToken";
import { Orders } from "./collections/Order";

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
    ApiKeys,
    Users,
    Supervisors,
    Permissions,
    Media,
    Categories,
    Partners,
    Offers,
    Coupons,
    Savings,
    Notifications,
    Tags,
    SearchRequests,
    EmailAuthTokens,
    Orders,
  ],
  localization: {
    locales: ["fr"],
    defaultLocale: "fr",
  },
  globals: [
    QuickAccess,
    LandingPartners,
    LandingFAQ,
    NewCategory,
    CategoriesList,
    TagsList,
  ],
  typescript: {
    outputFile: path.resolve(__dirname, "./payload-types.ts"),
  },
});
