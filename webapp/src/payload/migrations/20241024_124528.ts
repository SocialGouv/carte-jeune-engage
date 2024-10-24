import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from 'drizzle-orm'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
	await payload.db.drizzle.execute(sql`

DO $$ BEGIN
 CREATE TYPE "enum_offers_source" AS ENUM('cje', 'obiz');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "enum_offers_articles_kind" AS ENUM('variable_price', 'fixed_price');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "offers_articles" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"name" varchar,
	"reference" varchar,
	"reduction_percentage" numeric,
	"validity_to" timestamp(3) with time zone,
	"kind" "enum_offers_articles_kind",
	"minimum_price" numeric,
	"maximum_price" numeric,
	"public_price" numeric,
	"price" numeric,
	"obiz_json" jsonb
);

ALTER TABLE "offers_conditions" ALTER COLUMN "text" DROP NOT NULL;
ALTER TABLE "offers_condition_blocks" ALTER COLUMN "slug" DROP NOT NULL;
ALTER TABLE "offers" ALTER COLUMN "kind" SET DATA TYPE varchar;
ALTER TABLE "offers" ADD COLUMN "source" "enum_offers_source";
UPDATE "offers" SET "source" = 'cje'::enum_offers_source WHERE "source" IS NULL;
ALTER TABLE "offers" ALTER COLUMN "source" SET NOT NULL;
ALTER TABLE "offers" ADD COLUMN "obiz_id" varchar;
CREATE INDEX IF NOT EXISTS "offers_articles_order_idx" ON "offers_articles" ("_order");
CREATE INDEX IF NOT EXISTS "offers_articles_parent_id_idx" ON "offers_articles" ("_parent_id");
DO $$ BEGIN
 ALTER TABLE "offers_articles" ADD CONSTRAINT "offers_articles__parent_id_offers_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "offers"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
`);

};

export async function down({ payload }: MigrateDownArgs): Promise<void> {
	await payload.db.drizzle.execute(sql`

DO $$ BEGIN
 CREATE TYPE "enum_offers_kind" AS ENUM('voucher', 'voucher_pass', 'code', 'code_space');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DROP TABLE "offers_articles";
ALTER TABLE "offers_conditions" ALTER COLUMN "text" SET NOT NULL;
ALTER TABLE "offers_condition_blocks" ALTER COLUMN "slug" SET NOT NULL;
ALTER TABLE "offers" ALTER COLUMN "kind" SET DATA TYPE enum_offers_kind;
ALTER TABLE "offers" DROP COLUMN IF EXISTS "source";
ALTER TABLE "offers" DROP COLUMN IF EXISTS "obiz_id";`);

};
