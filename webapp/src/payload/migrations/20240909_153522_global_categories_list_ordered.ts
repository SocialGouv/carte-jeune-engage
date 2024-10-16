import { MigrateUpArgs, MigrateDownArgs } from "@payloadcms/db-postgres";
import { sql } from "drizzle-orm";

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`

CREATE TABLE IF NOT EXISTS "categories_list_items" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL
);

CREATE TABLE IF NOT EXISTS "categories_list" (
	"id" serial PRIMARY KEY NOT NULL,
	"updated_at" timestamp(3) with time zone,
	"created_at" timestamp(3) with time zone
);

CREATE TABLE IF NOT EXISTS "categories_list_rels" (
	"id" serial PRIMARY KEY NOT NULL,
	"order" integer,
	"parent_id" integer NOT NULL,
	"path" varchar NOT NULL,
	"categories_id" integer
);

CREATE INDEX IF NOT EXISTS "categories_list_items_order_idx" ON "categories_list_items" ("_order");
CREATE INDEX IF NOT EXISTS "categories_list_items_parent_id_idx" ON "categories_list_items" ("_parent_id");
CREATE INDEX IF NOT EXISTS "categories_list_rels_order_idx" ON "categories_list_rels" ("order");
CREATE INDEX IF NOT EXISTS "categories_list_rels_parent_idx" ON "categories_list_rels" ("parent_id");
CREATE INDEX IF NOT EXISTS "categories_list_rels_path_idx" ON "categories_list_rels" ("path");
DO $$ BEGIN
 ALTER TABLE "categories_list_items" ADD CONSTRAINT "categories_list_items__parent_id_categories_list_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "categories_list"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "categories_list_rels" ADD CONSTRAINT "categories_list_rels_parent_id_categories_list_id_fk" FOREIGN KEY ("parent_id") REFERENCES "categories_list"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "categories_list_rels" ADD CONSTRAINT "categories_list_rels_categories_id_categories_id_fk" FOREIGN KEY ("categories_id") REFERENCES "categories"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
`);
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`

DROP TABLE "categories_list_items";
DROP TABLE "categories_list";
DROP TABLE "categories_list_rels";`);
}
