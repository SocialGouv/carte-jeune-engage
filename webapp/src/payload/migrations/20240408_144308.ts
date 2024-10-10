import { MigrateUpArgs, MigrateDownArgs } from "@payloadcms/db-postgres";
import { sql } from "drizzle-orm";

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`

DO $$ BEGIN
 CREATE TYPE "enum_users_notification_status" AS ENUM('enabled', 'disabled');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "users" ADD COLUMN "notification_status" "enum_users_notification_status";
ALTER TABLE "users" ADD COLUMN "notification_subscription" jsonb;`);
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`

ALTER TABLE "users" DROP COLUMN IF EXISTS "notification_status";
ALTER TABLE "users" DROP COLUMN IF EXISTS "notification_subscription";`);
}
