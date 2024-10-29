import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from 'drizzle-orm'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
	await payload.db.drizzle.execute(sql`
    ALTER TABLE "offers_articles" ADD COLUMN "available" boolean;
    UPDATE "offers_articles" SET "available" = true;
  `);
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
	await payload.db.drizzle.execute(sql`
    ALTER TABLE "offers_articles" DROP COLUMN IF EXISTS "available";
  `);
}