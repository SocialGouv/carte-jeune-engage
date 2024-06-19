import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from 'drizzle-orm'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
await payload.db.drizzle.execute(sql`

CREATE TABLE IF NOT EXISTS "new_category_items" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL
);

CREATE TABLE IF NOT EXISTS "new_category" (
	"id" serial PRIMARY KEY NOT NULL,
	"label" varchar NOT NULL,
	"updated_at" timestamp(3) with time zone,
	"created_at" timestamp(3) with time zone
);

CREATE TABLE IF NOT EXISTS "new_category_rels" (
	"id" serial PRIMARY KEY NOT NULL,
	"order" integer,
	"parent_id" integer NOT NULL,
	"path" varchar NOT NULL,
	"media_id" integer,
	"offers_id" integer
);

CREATE INDEX IF NOT EXISTS "new_category_items_order_idx" ON "new_category_items" ("_order");
CREATE INDEX IF NOT EXISTS "new_category_items_parent_id_idx" ON "new_category_items" ("_parent_id");
CREATE INDEX IF NOT EXISTS "new_category_rels_order_idx" ON "new_category_rels" ("order");
CREATE INDEX IF NOT EXISTS "new_category_rels_parent_idx" ON "new_category_rels" ("parent_id");
CREATE INDEX IF NOT EXISTS "new_category_rels_path_idx" ON "new_category_rels" ("path");
DO $$ BEGIN
 ALTER TABLE "new_category_items" ADD CONSTRAINT "new_category_items__parent_id_new_category_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "new_category"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "new_category_rels" ADD CONSTRAINT "new_category_rels_parent_id_new_category_id_fk" FOREIGN KEY ("parent_id") REFERENCES "new_category"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "new_category_rels" ADD CONSTRAINT "new_category_rels_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "new_category_rels" ADD CONSTRAINT "new_category_rels_offers_id_offers_id_fk" FOREIGN KEY ("offers_id") REFERENCES "offers"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
`);

};

export async function down({ payload }: MigrateDownArgs): Promise<void> {
await payload.db.drizzle.execute(sql`

DROP TABLE "new_category_items";
DROP TABLE "new_category";
DROP TABLE "new_category_rels";`);

};
