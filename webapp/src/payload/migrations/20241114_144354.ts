import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from 'drizzle-orm'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
	await payload.db.drizzle.execute(sql`
		ALTER TABLE "media" 
    ADD COLUMN "prefix" varchar;
    
    UPDATE "media" SET prefix = 'public';
    
    ALTER TABLE "media" 
    ALTER COLUMN "prefix" SET DEFAULT 'public';
	`);

};

export async function down({ payload }: MigrateDownArgs): Promise<void> {
	await payload.db.drizzle.execute(sql`

ALTER TABLE "media" DROP COLUMN IF EXISTS "prefix";`);

};
