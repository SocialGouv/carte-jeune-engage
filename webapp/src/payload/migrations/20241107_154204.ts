import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from 'drizzle-orm'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
await payload.db.drizzle.execute(sql`

CREATE TABLE IF NOT EXISTS "ordersignals" (
	"id" serial PRIMARY KEY NOT NULL,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "ordersignals_rels" (
	"id" serial PRIMARY KEY NOT NULL,
	"order" integer,
	"parent_id" integer NOT NULL,
	"path" varchar NOT NULL,
	"orders_id" integer
);

CREATE INDEX IF NOT EXISTS "ordersignals_created_at_idx" ON "ordersignals" ("created_at");
CREATE INDEX IF NOT EXISTS "ordersignals_rels_order_idx" ON "ordersignals_rels" ("order");
CREATE INDEX IF NOT EXISTS "ordersignals_rels_parent_idx" ON "ordersignals_rels" ("parent_id");
CREATE INDEX IF NOT EXISTS "ordersignals_rels_path_idx" ON "ordersignals_rels" ("path");
DO $$ BEGIN
 ALTER TABLE "ordersignals_rels" ADD CONSTRAINT "ordersignals_rels_parent_id_ordersignals_id_fk" FOREIGN KEY ("parent_id") REFERENCES "ordersignals"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "ordersignals_rels" ADD CONSTRAINT "ordersignals_rels_orders_id_orders_id_fk" FOREIGN KEY ("orders_id") REFERENCES "orders"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
`);

};

export async function down({ payload }: MigrateDownArgs): Promise<void> {
await payload.db.drizzle.execute(sql`

DROP TABLE "ordersignals";
DROP TABLE "ordersignals_rels";`);

};
