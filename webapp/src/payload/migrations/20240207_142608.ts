import { MigrateUpArgs, MigrateDownArgs } from "@payloadcms/db-postgres";
import { sql } from "drizzle-orm";

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`

CREATE TABLE IF NOT EXISTS "savings" (
	"id" serial PRIMARY KEY NOT NULL,
	"amount" numeric,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "savings_rels" (
	"id" serial PRIMARY KEY NOT NULL,
	"order" integer,
	"parent_id" integer NOT NULL,
	"path" varchar NOT NULL,
	"coupons_id" integer
);

ALTER TABLE "coupons" ADD COLUMN "used_at" timestamp(3) with time zone;
ALTER TABLE "coupons" ADD COLUMN "assign_user_at" timestamp(3) with time zone;
CREATE INDEX IF NOT EXISTS "created_at_idx" ON "savings" ("created_at");
CREATE INDEX IF NOT EXISTS "order_idx" ON "savings_rels" ("order");
CREATE INDEX IF NOT EXISTS "parent_idx" ON "savings_rels" ("parent_id");
CREATE INDEX IF NOT EXISTS "path_idx" ON "savings_rels" ("path");
CREATE INDEX IF NOT EXISTS "key_idx" ON "payload_preferences" ("key");
ALTER TABLE "coupons" DROP COLUMN IF EXISTS "status";
DO $$ BEGIN
 ALTER TABLE "savings_rels" ADD CONSTRAINT "savings_rels_parent_id_savings_id_fk" FOREIGN KEY ("parent_id") REFERENCES "savings"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "savings_rels" ADD CONSTRAINT "savings_rels_coupons_id_coupons_id_fk" FOREIGN KEY ("coupons_id") REFERENCES "coupons"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
`);
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`

DO $$ BEGIN
 CREATE TYPE "enum_coupons_status" AS ENUM('available', 'archived');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DROP TABLE "savings";
DROP TABLE "savings_rels";
DROP INDEX IF EXISTS "key_idx";
ALTER TABLE "coupons" ADD COLUMN "status" "enum_coupons_status" NOT NULL;
ALTER TABLE "coupons" DROP COLUMN IF EXISTS "used_at";
ALTER TABLE "coupons" DROP COLUMN IF EXISTS "assign_user_at";`);
}
