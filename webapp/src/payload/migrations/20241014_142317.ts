import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from 'drizzle-orm'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
await payload.db.drizzle.execute(sql`

ALTER TABLE "users_rels" RENAME COLUMN "categories_id" TO "tags_id";
ALTER TABLE "users_rels" DROP CONSTRAINT "users_rels_categories_id_categories_id_fk";

DO $$ BEGIN
 ALTER TABLE "users_rels" ADD CONSTRAINT "users_rels_tags_id_tags_id_fk" FOREIGN KEY ("tags_id") REFERENCES "tags"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
`);

};

export async function down({ payload }: MigrateDownArgs): Promise<void> {
await payload.db.drizzle.execute(sql`

ALTER TABLE "users_rels" RENAME COLUMN "tags_id" TO "categories_id";
ALTER TABLE "users_rels" DROP CONSTRAINT "users_rels_tags_id_tags_id_fk";

DO $$ BEGIN
 ALTER TABLE "users_rels" ADD CONSTRAINT "users_rels_categories_id_categories_id_fk" FOREIGN KEY ("categories_id") REFERENCES "categories"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
`);

};
