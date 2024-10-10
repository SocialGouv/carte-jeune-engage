import { MigrateUpArgs, MigrateDownArgs } from "@payloadcms/db-postgres";
import { sql } from "drizzle-orm";

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`

CREATE TABLE IF NOT EXISTS "email_auth_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"token" varchar NOT NULL,
	"expiration" timestamp(3) with time zone,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "email_auth_tokens_rels" (
	"id" serial PRIMARY KEY NOT NULL,
	"order" integer,
	"parent_id" integer NOT NULL,
	"path" varchar NOT NULL,
	"users_id" integer
);

CREATE INDEX IF NOT EXISTS "email_auth_tokens_created_at_idx" ON "email_auth_tokens" ("created_at");
CREATE INDEX IF NOT EXISTS "email_auth_tokens_rels_order_idx" ON "email_auth_tokens_rels" ("order");
CREATE INDEX IF NOT EXISTS "email_auth_tokens_rels_parent_idx" ON "email_auth_tokens_rels" ("parent_id");
CREATE INDEX IF NOT EXISTS "email_auth_tokens_rels_path_idx" ON "email_auth_tokens_rels" ("path");
DO $$ BEGIN
 ALTER TABLE "email_auth_tokens_rels" ADD CONSTRAINT "email_auth_tokens_rels_parent_id_email_auth_tokens_id_fk" FOREIGN KEY ("parent_id") REFERENCES "email_auth_tokens"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "email_auth_tokens_rels" ADD CONSTRAINT "email_auth_tokens_rels_users_id_users_id_fk" FOREIGN KEY ("users_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
`);
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`

DROP TABLE "email_auth_tokens";
DROP TABLE "email_auth_tokens_rels";`);
}
