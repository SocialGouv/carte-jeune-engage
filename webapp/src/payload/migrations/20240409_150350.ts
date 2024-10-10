import { MigrateUpArgs, MigrateDownArgs } from "@payloadcms/db-postgres";
import { sql } from "drizzle-orm";

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`

CREATE TABLE IF NOT EXISTS "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar NOT NULL,
	"title" varchar NOT NULL,
	"message" varchar,
	"error" jsonb,
	"app_version" varchar,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "notifications_rels" (
	"id" serial PRIMARY KEY NOT NULL,
	"order" integer,
	"parent_id" integer NOT NULL,
	"path" varchar NOT NULL,
	"users_id" integer
);

CREATE INDEX IF NOT EXISTS "notifications_created_at_idx" ON "notifications" ("created_at");
CREATE INDEX IF NOT EXISTS "notifications_rels_order_idx" ON "notifications_rels" ("order");
CREATE INDEX IF NOT EXISTS "notifications_rels_parent_idx" ON "notifications_rels" ("parent_id");
CREATE INDEX IF NOT EXISTS "notifications_rels_path_idx" ON "notifications_rels" ("path");
DO $$ BEGIN
 ALTER TABLE "notifications_rels" ADD CONSTRAINT "notifications_rels_parent_id_notifications_id_fk" FOREIGN KEY ("parent_id") REFERENCES "notifications"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "notifications_rels" ADD CONSTRAINT "notifications_rels_users_id_users_id_fk" FOREIGN KEY ("users_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
`);
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`

DROP TABLE "notifications";
DROP TABLE "notifications_rels";`);
}
