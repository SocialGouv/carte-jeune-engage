import { MigrateUpArgs, MigrateDownArgs } from "@payloadcms/db-postgres";
import { sql } from "drizzle-orm";

export async function up({ payload }: MigrateUpArgs): Promise<void> {
	await payload.db.drizzle.execute(sql`
    ALTER TABLE "offers_articles" ADD COLUMN "obiz_id" text;
    
    UPDATE "offers_articles"
    SET "obiz_id" = CAST("obiz_json"->>'articles_id' AS text);
  `);
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
	await payload.db.drizzle.execute(sql`
    ALTER TABLE "offers_articles" DROP COLUMN IF EXISTS "obiz_id";
  `);
}