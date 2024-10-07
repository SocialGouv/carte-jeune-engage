import { MigrateUpArgs, MigrateDownArgs } from "@payloadcms/db-postgres";
import { sql } from "drizzle-orm";

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`

DO $$ BEGIN
 CREATE TYPE "enum_users_civility" AS ENUM('man', 'woman');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "enum_users_time_at_c_e_j" AS ENUM('started', 'lessThan3Months', 'moreThan3Months');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "users" ADD COLUMN "civility" "enum_users_civility";
ALTER TABLE "users" ADD COLUMN "birth_date" timestamp(3) with time zone;
ALTER TABLE "users" ADD COLUMN "timeAtCEJ" "enum_users_time_at_c_e_j";
ALTER TABLE "users" ADD COLUMN "user_email" varchar;`);
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`

ALTER TABLE "users" DROP COLUMN IF EXISTS "civility";
ALTER TABLE "users" DROP COLUMN IF EXISTS "birth_date";
ALTER TABLE "users" DROP COLUMN IF EXISTS "timeAtCEJ";
ALTER TABLE "users" DROP COLUMN IF EXISTS "user_email";`);
}
