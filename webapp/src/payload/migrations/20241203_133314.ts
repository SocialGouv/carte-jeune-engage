import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from 'drizzle-orm'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
await payload.db.drizzle.execute(sql`

CREATE TABLE IF NOT EXISTS "forms_blocks_country_icon_legend" (
	"_order" integer NOT NULL,
	"_parent_id" varchar NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"icon" varchar
);

ALTER TABLE "form_submissions_rels" ADD COLUMN "offers_id" integer;
CREATE INDEX IF NOT EXISTS "forms_blocks_country_icon_legend_order_idx" ON "forms_blocks_country_icon_legend" ("_order");
CREATE INDEX IF NOT EXISTS "forms_blocks_country_icon_legend_parent_id_idx" ON "forms_blocks_country_icon_legend" ("_parent_id");
DO $$ BEGIN
 ALTER TABLE "form_submissions_rels" ADD CONSTRAINT "form_submissions_rels_offers_id_offers_id_fk" FOREIGN KEY ("offers_id") REFERENCES "offers"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "forms_blocks_country_icon_legend" ADD CONSTRAINT "forms_blocks_country_icon_legend__parent_id_forms_blocks_country_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "forms_blocks_country"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
`);

};

export async function down({ payload }: MigrateDownArgs): Promise<void> {
await payload.db.drizzle.execute(sql`

DROP TABLE "forms_blocks_country_icon_legend";
ALTER TABLE "form_submissions_rels" DROP CONSTRAINT "form_submissions_rels_offers_id_offers_id_fk";

ALTER TABLE "form_submissions_rels" DROP COLUMN IF EXISTS "offers_id";`);

};
