import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { slateEditor } from "@payloadcms/richtext-slate";
import { s3Storage } from "@payloadcms/storage-s3";
import { nodemailerAdapter } from "@payloadcms/email-nodemailer";

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
import { OrderSignals } from "./collections/OrderSignal";

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET as string,
  db: postgresAdapter({
    migrationDir: path.resolve(dirname, "./migrations"),
    pool: {
      connectionString:
        process.env.NODE_ENV !== "production"
          ? process.env.DATABASE_URL
          : `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}?sslmode=disable`,
    },
  }),
  plugins: [
    s3Storage({
      collections: {
        media: {
          disableLocalStorage: true,
          disablePayloadAccessControl: true,
          prefix: "public",
          generateFileURL: (file) =>
            `https://${process.env.S3_BUCKET_NAME}.${(process.env.S3_ENDPOINT || "").replace("https://", "")}/public/${file.filename}`,
        },
      },
      config: {
        endpoint: process.env.S3_ENDPOINT,
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID ?? "",
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "",
        },
        region: process.env.S3_REGION ?? "",
      },
      acl: "public-read",
      bucket: process.env.S3_BUCKET_NAME ?? "",
    }),
  ],
  email: nodemailerAdapter({
    transportOptions: {
      host: process.env.SMTP_HOST,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
      port: parseInt(process.env.SMTP_PORT as string),
    },
    defaultFromName: process.env.SMTP_FROM_NAME as string,
    defaultFromAddress: process.env.SMTP_FROM_ADDRESS as string,
  }),
  editor: slateEditor({}),
  admin: {
    user: "admins",
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    Admins,
    Users,
    Supervisors,
    Permissions,
    ApiKeys,
    Categories,
    Tags,
    Partners,
    Media,
    Offers,
    Coupons,
    Orders,
    Savings,
    OrderSignals,
    Notifications,
    SearchRequests,
    EmailAuthTokens,
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
    outputFile: path.resolve(dirname, "./payload-types.ts"),
  },
  sharp,
});
