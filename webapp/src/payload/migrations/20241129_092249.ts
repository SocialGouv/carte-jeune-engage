import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from 'drizzle-orm'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
await payload.db.drizzle.execute(sql`

DO $$ BEGIN
 CREATE TYPE "enum_forms_confirmation_type" AS ENUM('message', 'redirect');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "forms_blocks_country_text_legend" (
	"_order" integer NOT NULL,
	"_parent_id" varchar NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"label" varchar
);

CREATE TABLE IF NOT EXISTS "forms_blocks_country" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"label" varchar,
	"required" boolean,
	"min" numeric,
	"max" numeric,
	"block_name" varchar
);

CREATE TABLE IF NOT EXISTS "forms_blocks_textarea" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"label" varchar,
	"required" boolean,
	"placeholder" varchar,
	"block_name" varchar
);

CREATE TABLE IF NOT EXISTS "forms_emails" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"email_to" varchar,
	"cc" varchar,
	"bcc" varchar,
	"reply_to" varchar,
	"email_from" varchar
);

CREATE TABLE IF NOT EXISTS "forms_emails_locales" (
	"subject" varchar NOT NULL,
	"message" jsonb,
	"id" serial PRIMARY KEY NOT NULL,
	"_locale" "_locales" NOT NULL,
	"_parent_id" varchar NOT NULL,
	CONSTRAINT "forms_emails_locales_locale_parent_id_unique" UNIQUE("_locale","_parent_id")
);

CREATE TABLE IF NOT EXISTS "forms" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar NOT NULL,
	"confirmationType" "enum_forms_confirmation_type",
	"redirect_url" varchar,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "forms_locales" (
	"submit_button_label" varchar,
	"confirmation_message" jsonb,
	"id" serial PRIMARY KEY NOT NULL,
	"_locale" "_locales" NOT NULL,
	"_parent_id" integer NOT NULL,
	CONSTRAINT "forms_locales_locale_parent_id_unique" UNIQUE("_locale","_parent_id")
);

CREATE TABLE IF NOT EXISTS "form_submissions_submission_data" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"field" varchar NOT NULL,
	"value" varchar NOT NULL
);

CREATE TABLE IF NOT EXISTS "form_submissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "form_submissions_rels" (
	"id" serial PRIMARY KEY NOT NULL,
	"order" integer,
	"parent_id" integer NOT NULL,
	"path" varchar NOT NULL,
	"forms_id" integer
);

CREATE INDEX IF NOT EXISTS "forms_blocks_country_text_legend_order_idx" ON "forms_blocks_country_text_legend" ("_order");
CREATE INDEX IF NOT EXISTS "forms_blocks_country_text_legend_parent_id_idx" ON "forms_blocks_country_text_legend" ("_parent_id");
CREATE INDEX IF NOT EXISTS "forms_blocks_country_order_idx" ON "forms_blocks_country" ("_order");
CREATE INDEX IF NOT EXISTS "forms_blocks_country_parent_id_idx" ON "forms_blocks_country" ("_parent_id");
CREATE INDEX IF NOT EXISTS "forms_blocks_country_path_idx" ON "forms_blocks_country" ("_path");
CREATE INDEX IF NOT EXISTS "forms_blocks_textarea_order_idx" ON "forms_blocks_textarea" ("_order");
CREATE INDEX IF NOT EXISTS "forms_blocks_textarea_parent_id_idx" ON "forms_blocks_textarea" ("_parent_id");
CREATE INDEX IF NOT EXISTS "forms_blocks_textarea_path_idx" ON "forms_blocks_textarea" ("_path");
CREATE INDEX IF NOT EXISTS "forms_emails_order_idx" ON "forms_emails" ("_order");
CREATE INDEX IF NOT EXISTS "forms_emails_parent_id_idx" ON "forms_emails" ("_parent_id");
CREATE INDEX IF NOT EXISTS "forms_created_at_idx" ON "forms" ("created_at");
CREATE INDEX IF NOT EXISTS "form_submissions_submission_data_order_idx" ON "form_submissions_submission_data" ("_order");
CREATE INDEX IF NOT EXISTS "form_submissions_submission_data_parent_id_idx" ON "form_submissions_submission_data" ("_parent_id");
CREATE INDEX IF NOT EXISTS "form_submissions_created_at_idx" ON "form_submissions" ("created_at");
CREATE INDEX IF NOT EXISTS "form_submissions_rels_order_idx" ON "form_submissions_rels" ("order");
CREATE INDEX IF NOT EXISTS "form_submissions_rels_parent_idx" ON "form_submissions_rels" ("parent_id");
CREATE INDEX IF NOT EXISTS "form_submissions_rels_path_idx" ON "form_submissions_rels" ("path");
DO $$ BEGIN
 ALTER TABLE "forms_blocks_country_text_legend" ADD CONSTRAINT "forms_blocks_country_text_legend__parent_id_forms_blocks_country_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "forms_blocks_country"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "forms_blocks_country" ADD CONSTRAINT "forms_blocks_country__parent_id_forms_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "forms"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "forms_blocks_textarea" ADD CONSTRAINT "forms_blocks_textarea__parent_id_forms_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "forms"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "forms_emails" ADD CONSTRAINT "forms_emails__parent_id_forms_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "forms"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "forms_emails_locales" ADD CONSTRAINT "forms_emails_locales__parent_id_forms_emails_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "forms_emails"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "forms_locales" ADD CONSTRAINT "forms_locales__parent_id_forms_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "forms"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "form_submissions_submission_data" ADD CONSTRAINT "form_submissions_submission_data__parent_id_form_submissions_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "form_submissions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "form_submissions_rels" ADD CONSTRAINT "form_submissions_rels_parent_id_form_submissions_id_fk" FOREIGN KEY ("parent_id") REFERENCES "form_submissions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "form_submissions_rels" ADD CONSTRAINT "form_submissions_rels_forms_id_forms_id_fk" FOREIGN KEY ("forms_id") REFERENCES "forms"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
`);

};

export async function down({ payload }: MigrateDownArgs): Promise<void> {
await payload.db.drizzle.execute(sql`

DROP TABLE "forms_blocks_country_text_legend";
DROP TABLE "forms_blocks_country";
DROP TABLE "forms_blocks_textarea";
DROP TABLE "forms_emails";
DROP TABLE "forms_emails_locales";
DROP TABLE "forms";
DROP TABLE "forms_locales";
DROP TABLE "form_submissions_submission_data";
DROP TABLE "form_submissions";
DROP TABLE "form_submissions_rels";`);

};
