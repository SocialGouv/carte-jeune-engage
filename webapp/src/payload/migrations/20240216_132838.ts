import { MigrateUpArgs, MigrateDownArgs } from "@payloadcms/db-postgres";
import { sql } from "drizzle-orm";

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`

ALTER TABLE "permissions" RENAME COLUMN "phone" TO "phone_number";
DROP INDEX IF EXISTS "phone_idx";
CREATE UNIQUE INDEX IF NOT EXISTS "phone_number_idx" ON "permissions" ("phone_number");`);
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`

ALTER TABLE "permissions" RENAME COLUMN "phone_number" TO "phone";
DROP INDEX IF EXISTS "phone_number_idx";
CREATE UNIQUE INDEX IF NOT EXISTS "phone_idx" ON "permissions" ("phone");`);
}
