import { MigrateUpArgs, MigrateDownArgs } from "@payloadcms/db-postgres";
import { sql } from "drizzle-orm";

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`

ALTER TABLE "users" ADD COLUMN "otp_request_token" varchar;
ALTER TABLE "offers" ADD COLUMN "validity_from" timestamp(3) with time zone;`);
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`

ALTER TABLE "users" DROP COLUMN IF EXISTS "otp_request_token";
ALTER TABLE "offers" DROP COLUMN IF EXISTS "validity_from";`);
}
