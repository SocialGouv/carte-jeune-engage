import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from 'drizzle-orm'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
await payload.db.drizzle.execute(sql`

CREATE TABLE IF NOT EXISTS "orders_articles" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"article_reference" varchar NOT NULL,
	"article_quantity" numeric NOT NULL,
	"article_montant" numeric NOT NULL
);

CREATE TABLE IF NOT EXISTS "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"number" numeric NOT NULL,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "orders_rels" (
	"id" serial PRIMARY KEY NOT NULL,
	"order" integer,
	"parent_id" integer NOT NULL,
	"path" varchar NOT NULL,
	"users_id" integer
);

CREATE INDEX IF NOT EXISTS "orders_articles_order_idx" ON "orders_articles" ("_order");
CREATE INDEX IF NOT EXISTS "orders_articles_parent_id_idx" ON "orders_articles" ("_parent_id");
CREATE UNIQUE INDEX IF NOT EXISTS "orders_number_idx" ON "orders" ("number");
CREATE INDEX IF NOT EXISTS "orders_created_at_idx" ON "orders" ("created_at");
CREATE INDEX IF NOT EXISTS "orders_rels_order_idx" ON "orders_rels" ("order");
CREATE INDEX IF NOT EXISTS "orders_rels_parent_idx" ON "orders_rels" ("parent_id");
CREATE INDEX IF NOT EXISTS "orders_rels_path_idx" ON "orders_rels" ("path");
DO $$ BEGIN
 ALTER TABLE "orders_articles" ADD CONSTRAINT "orders_articles__parent_id_orders_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "orders"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "orders_rels" ADD CONSTRAINT "orders_rels_parent_id_orders_id_fk" FOREIGN KEY ("parent_id") REFERENCES "orders"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "orders_rels" ADD CONSTRAINT "orders_rels_users_id_users_id_fk" FOREIGN KEY ("users_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
`);

};

export async function down({ payload }: MigrateDownArgs): Promise<void> {
await payload.db.drizzle.execute(sql`

DROP TABLE "orders_articles";
DROP TABLE "orders";
DROP TABLE "orders_rels";`);

};
