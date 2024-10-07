import { MigrateUpArgs, MigrateDownArgs } from "@payloadcms/db-postgres";
import { sql } from "drizzle-orm";

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`

CREATE TABLE IF NOT EXISTS "landing_partners_items" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL
);

CREATE TABLE IF NOT EXISTS "landing_partners" (
	"id" serial PRIMARY KEY NOT NULL,
	"updated_at" timestamp(3) with time zone,
	"created_at" timestamp(3) with time zone
);

CREATE TABLE IF NOT EXISTS "landing_partners_rels" (
	"id" serial PRIMARY KEY NOT NULL,
	"order" integer,
	"parent_id" integer NOT NULL,
	"path" varchar NOT NULL,
	"partners_id" integer
);

CREATE TABLE IF NOT EXISTS "landing_f_a_q_items" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"title" varchar NOT NULL,
	"content" varchar NOT NULL
);

CREATE TABLE IF NOT EXISTS "landing_f_a_q" (
	"id" serial PRIMARY KEY NOT NULL,
	"updated_at" timestamp(3) with time zone,
	"created_at" timestamp(3) with time zone
);

CREATE INDEX IF NOT EXISTS "_order_idx" ON "landing_partners_items" ("_order");
CREATE INDEX IF NOT EXISTS "_parent_id_idx" ON "landing_partners_items" ("_parent_id");
CREATE INDEX IF NOT EXISTS "order_idx" ON "landing_partners_rels" ("order");
CREATE INDEX IF NOT EXISTS "parent_idx" ON "landing_partners_rels" ("parent_id");
CREATE INDEX IF NOT EXISTS "path_idx" ON "landing_partners_rels" ("path");
CREATE INDEX IF NOT EXISTS "_order_idx" ON "landing_f_a_q_items" ("_order");
CREATE INDEX IF NOT EXISTS "_parent_id_idx" ON "landing_f_a_q_items" ("_parent_id");
DO $$ BEGIN
 ALTER TABLE "landing_partners_items" ADD CONSTRAINT "landing_partners_items__parent_id_landing_partners_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "landing_partners"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "landing_partners_rels" ADD CONSTRAINT "landing_partners_rels_parent_id_landing_partners_id_fk" FOREIGN KEY ("parent_id") REFERENCES "landing_partners"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "landing_partners_rels" ADD CONSTRAINT "landing_partners_rels_partners_id_partners_id_fk" FOREIGN KEY ("partners_id") REFERENCES "partners"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "landing_f_a_q_items" ADD CONSTRAINT "landing_f_a_q_items__parent_id_landing_f_a_q_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "landing_f_a_q"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
`);
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`

DROP TABLE "landing_partners_items";
DROP TABLE "landing_partners";
DROP TABLE "landing_partners_rels";
DROP TABLE "landing_f_a_q_items";
DROP TABLE "landing_f_a_q";`);
}
