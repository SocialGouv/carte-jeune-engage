import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from 'drizzle-orm'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
await payload.db.drizzle.execute(sql`

DO $$ BEGIN
 CREATE TYPE "enum_supervisors_kind" AS ENUM('ML', 'SC', 'FT');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "permissions_rels" (
	"id" serial PRIMARY KEY NOT NULL,
	"order" integer,
	"parent_id" integer NOT NULL,
	"path" varchar NOT NULL,
	"supervisors_id" integer
);

ALTER TABLE "supervisors" ADD COLUMN "kind" "enum_supervisors_kind";
CREATE INDEX IF NOT EXISTS "permissions_rels_order_idx" ON "permissions_rels" ("order");
CREATE INDEX IF NOT EXISTS "permissions_rels_parent_idx" ON "permissions_rels" ("parent_id");
CREATE INDEX IF NOT EXISTS "permissions_rels_path_idx" ON "permissions_rels" ("path");
DO $$ BEGIN
 ALTER TABLE "permissions_rels" ADD CONSTRAINT "permissions_rels_parent_id_permissions_id_fk" FOREIGN KEY ("parent_id") REFERENCES "permissions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "permissions_rels" ADD CONSTRAINT "permissions_rels_supervisors_id_supervisors_id_fk" FOREIGN KEY ("supervisors_id") REFERENCES "supervisors"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
`);

};

export async function down({ payload }: MigrateDownArgs): Promise<void> {
await payload.db.drizzle.execute(sql`

DROP TABLE "permissions_rels";
ALTER TABLE "supervisors" DROP COLUMN IF EXISTS "kind";`);

};
