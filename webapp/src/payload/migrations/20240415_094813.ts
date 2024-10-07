import { MigrateUpArgs, MigrateDownArgs } from "@payloadcms/db-postgres";
import { sql } from "drizzle-orm";

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`

DO $$ BEGIN
 CREATE TYPE "enum_permissions_supervisor_kind" AS ENUM('ML', 'SC', 'FT');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "permissions" ADD COLUMN "supervisorKind" "enum_permissions_supervisor_kind";`);
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`

ALTER TABLE "permissions" DROP COLUMN IF EXISTS "supervisorKind";`);
}
