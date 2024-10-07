import { MigrateUpArgs, MigrateDownArgs } from "@payloadcms/db-postgres";
import { sql } from "drizzle-orm";

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`

DO $$ BEGIN
 CREATE TYPE "enum_users_has_a_job_idea" AS ENUM('yes', 'no');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "users" ADD COLUMN "hasAJobIdea" "enum_users_has_a_job_idea";
ALTER TABLE "users" ADD COLUMN "project_title" varchar;
ALTER TABLE "users" ADD COLUMN "project_description" varchar;`);
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`

ALTER TABLE "users" DROP COLUMN IF EXISTS "hasAJobIdea";
ALTER TABLE "users" DROP COLUMN IF EXISTS "project_title";
ALTER TABLE "users" DROP COLUMN IF EXISTS "project_description";`);
}
