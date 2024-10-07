import { MigrateUpArgs, MigrateDownArgs } from "@payloadcms/db-postgres";
import { sql } from "drizzle-orm";

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`

CREATE TABLE IF NOT EXISTS "tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar NOT NULL,
	"label" varchar NOT NULL,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "tags_rels" (
	"id" serial PRIMARY KEY NOT NULL,
	"order" integer,
	"parent_id" integer NOT NULL,
	"path" varchar NOT NULL,
	"media_id" integer
);

CREATE TABLE IF NOT EXISTS "tags_list_items" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL
);

CREATE TABLE IF NOT EXISTS "tags_list" (
	"id" serial PRIMARY KEY NOT NULL,
	"updated_at" timestamp(3) with time zone,
	"created_at" timestamp(3) with time zone
);

CREATE TABLE IF NOT EXISTS "tags_list_rels" (
	"id" serial PRIMARY KEY NOT NULL,
	"order" integer,
	"parent_id" integer NOT NULL,
	"path" varchar NOT NULL,
	"tags_id" integer
);

ALTER TABLE "offers_rels" ADD COLUMN "tags_id" integer;
CREATE UNIQUE INDEX IF NOT EXISTS "tags_slug_idx" ON "tags" ("slug");
CREATE INDEX IF NOT EXISTS "tags_created_at_idx" ON "tags" ("created_at");
CREATE INDEX IF NOT EXISTS "tags_rels_order_idx" ON "tags_rels" ("order");
CREATE INDEX IF NOT EXISTS "tags_rels_parent_idx" ON "tags_rels" ("parent_id");
CREATE INDEX IF NOT EXISTS "tags_rels_path_idx" ON "tags_rels" ("path");
CREATE INDEX IF NOT EXISTS "tags_list_items_order_idx" ON "tags_list_items" ("_order");
CREATE INDEX IF NOT EXISTS "tags_list_items_parent_id_idx" ON "tags_list_items" ("_parent_id");
CREATE INDEX IF NOT EXISTS "tags_list_rels_order_idx" ON "tags_list_rels" ("order");
CREATE INDEX IF NOT EXISTS "tags_list_rels_parent_idx" ON "tags_list_rels" ("parent_id");
CREATE INDEX IF NOT EXISTS "tags_list_rels_path_idx" ON "tags_list_rels" ("path");
DO $$ BEGIN
 ALTER TABLE "offers_rels" ADD CONSTRAINT "offers_rels_tags_id_tags_id_fk" FOREIGN KEY ("tags_id") REFERENCES "tags"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "tags_rels" ADD CONSTRAINT "tags_rels_parent_id_tags_id_fk" FOREIGN KEY ("parent_id") REFERENCES "tags"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "tags_rels" ADD CONSTRAINT "tags_rels_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "tags_list_items" ADD CONSTRAINT "tags_list_items__parent_id_tags_list_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "tags_list"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "tags_list_rels" ADD CONSTRAINT "tags_list_rels_parent_id_tags_list_id_fk" FOREIGN KEY ("parent_id") REFERENCES "tags_list"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "tags_list_rels" ADD CONSTRAINT "tags_list_rels_tags_id_tags_id_fk" FOREIGN KEY ("tags_id") REFERENCES "tags"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
`);
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`

DROP TABLE "tags";
DROP TABLE "tags_rels";
DROP TABLE "tags_list_items";
DROP TABLE "tags_list";
DROP TABLE "tags_list_rels";
ALTER TABLE "offers_rels" DROP CONSTRAINT "offers_rels_tags_id_tags_id_fk";

ALTER TABLE "offers_rels" DROP COLUMN IF EXISTS "tags_id";`);
}
