import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from 'drizzle-orm'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
	await payload.db.drizzle.execute(sql`
    CREATE INDEX IF NOT EXISTS "coupons_rels_offer_idx" ON "coupons_rels" ("offers_id");
  `);
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
	await payload.db.drizzle.execute(sql`
    DROP INDEX IF EXISTS "coupons_rels_offer_idx";
  `);
}