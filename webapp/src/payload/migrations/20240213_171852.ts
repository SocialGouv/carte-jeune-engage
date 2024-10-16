import { MigrateUpArgs, MigrateDownArgs } from "@payloadcms/db-postgres";
import { sql } from "drizzle-orm";

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`

CREATE TABLE IF NOT EXISTS "supervisors" (
	"id" serial PRIMARY KEY NOT NULL,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"email" varchar NOT NULL,
	"reset_password_token" varchar,
	"reset_password_expiration" timestamp(3) with time zone,
	"salt" varchar,
	"hash" varchar,
	"login_attempts" numeric,
	"lock_until" timestamp(3) with time zone
);

ALTER TABLE "users" ALTER COLUMN "first_name" DROP NOT NULL;
ALTER TABLE "users" ALTER COLUMN "last_name" DROP NOT NULL;
ALTER TABLE "users" ALTER COLUMN "phone_number" SET NOT NULL;
ALTER TABLE "payload_preferences_rels" ADD COLUMN "supervisors_id" integer;
CREATE INDEX IF NOT EXISTS "created_at_idx" ON "supervisors" ("created_at");
CREATE UNIQUE INDEX IF NOT EXISTS "email_idx" ON "supervisors" ("email");
CREATE UNIQUE INDEX IF NOT EXISTS "phone_number_idx" ON "users" ("phone_number");
DO $$ BEGIN
 ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_supervisors_id_supervisors_id_fk" FOREIGN KEY ("supervisors_id") REFERENCES "supervisors"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
`);
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`

DROP TABLE "supervisors";
ALTER TABLE "payload_preferences_rels" DROP CONSTRAINT "payload_preferences_rels_supervisors_id_supervisors_id_fk";

DROP INDEX IF EXISTS "phone_number_idx";
ALTER TABLE "users" ALTER COLUMN "phone_number" DROP NOT NULL;
ALTER TABLE "users" ALTER COLUMN "first_name" SET NOT NULL;
ALTER TABLE "users" ALTER COLUMN "last_name" SET NOT NULL;
ALTER TABLE "payload_preferences_rels" DROP COLUMN IF EXISTS "supervisors_id";`);
}
