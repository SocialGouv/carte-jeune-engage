import { MigrateUpArgs, MigrateDownArgs } from "@payloadcms/db-postgres";
import { sql } from "drizzle-orm";

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`

CREATE TABLE IF NOT EXISTS "quick_access_items" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL
);

CREATE TABLE IF NOT EXISTS "quick_access" (
	"id" serial PRIMARY KEY NOT NULL,
	"updated_at" timestamp(3) with time zone,
	"created_at" timestamp(3) with time zone
);

CREATE TABLE IF NOT EXISTS "quick_access_rels" (
	"id" serial PRIMARY KEY NOT NULL,
	"order" integer,
	"parent_id" integer NOT NULL,
	"path" varchar NOT NULL,
	"partners_id" integer,
	"offers_id" integer
);

CREATE INDEX IF NOT EXISTS "_order_idx" ON "quick_access_items" ("_order");
CREATE INDEX IF NOT EXISTS "_parent_id_idx" ON "quick_access_items" ("_parent_id");
CREATE INDEX IF NOT EXISTS "order_idx" ON "quick_access_rels" ("order");
CREATE INDEX IF NOT EXISTS "parent_idx" ON "quick_access_rels" ("parent_id");
CREATE INDEX IF NOT EXISTS "path_idx" ON "quick_access_rels" ("path");
DO $$ BEGIN
 ALTER TABLE "quick_access_items" ADD CONSTRAINT "quick_access_items__parent_id_quick_access_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "quick_access"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "quick_access_rels" ADD CONSTRAINT "quick_access_rels_parent_id_quick_access_id_fk" FOREIGN KEY ("parent_id") REFERENCES "quick_access"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "quick_access_rels" ADD CONSTRAINT "quick_access_rels_partners_id_partners_id_fk" FOREIGN KEY ("partners_id") REFERENCES "partners"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "quick_access_rels" ADD CONSTRAINT "quick_access_rels_offers_id_offers_id_fk" FOREIGN KEY ("offers_id") REFERENCES "offers"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
`);
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`

DROP TABLE "quick_access_items";
DROP TABLE "quick_access";
DROP TABLE "quick_access_rels";`);
}
