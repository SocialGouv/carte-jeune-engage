import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from 'drizzle-orm'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
await payload.db.drizzle.execute(sql`

CREATE TABLE IF NOT EXISTS "couponsignals" (
	"id" serial PRIMARY KEY NOT NULL,
	"cause" varchar,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "couponsignals_rels" (
	"id" serial PRIMARY KEY NOT NULL,
	"order" integer,
	"parent_id" integer NOT NULL,
	"path" varchar NOT NULL,
	"coupons_id" integer
);

CREATE INDEX IF NOT EXISTS "couponsignals_created_at_idx" ON "couponsignals" ("created_at");
CREATE INDEX IF NOT EXISTS "couponsignals_rels_order_idx" ON "couponsignals_rels" ("order");
CREATE INDEX IF NOT EXISTS "couponsignals_rels_parent_idx" ON "couponsignals_rels" ("parent_id");
CREATE INDEX IF NOT EXISTS "couponsignals_rels_path_idx" ON "couponsignals_rels" ("path");
DO $$ BEGIN
 ALTER TABLE "couponsignals_rels" ADD CONSTRAINT "couponsignals_rels_parent_id_couponsignals_id_fk" FOREIGN KEY ("parent_id") REFERENCES "couponsignals"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "couponsignals_rels" ADD CONSTRAINT "couponsignals_rels_coupons_id_coupons_id_fk" FOREIGN KEY ("coupons_id") REFERENCES "coupons"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
`);

};

export async function down({ payload }: MigrateDownArgs): Promise<void> {
await payload.db.drizzle.execute(sql`

DROP TABLE "couponsignals";
DROP TABLE "couponsignals_rels";`);

};
