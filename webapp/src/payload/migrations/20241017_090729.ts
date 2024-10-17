import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from 'drizzle-orm'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
await payload.db.drizzle.execute(sql`

CREATE TABLE IF NOT EXISTS "apikeys" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" varchar NOT NULL,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "apikeys_key_idx" ON "apikeys" ("key");
CREATE INDEX IF NOT EXISTS "apikeys_created_at_idx" ON "apikeys" ("created_at");`);

};

export async function down({ payload }: MigrateDownArgs): Promise<void> {
await payload.db.drizzle.execute(sql`

DROP TABLE "apikeys";`);

};
