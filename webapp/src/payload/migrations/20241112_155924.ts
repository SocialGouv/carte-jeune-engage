import { MigrateUpArgs, MigrateDownArgs } from "@payloadcms/db-postgres";
import { sql } from "drizzle-orm";

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`

  ALTER TABLE "orders_articles" 
  ADD COLUMN "article_montant_discounted" numeric;
  
  -- Update all existing rows to have value 0
  UPDATE "orders_articles" 
  SET "article_montant_discounted" = 0;
  
  -- Now make it NOT NULL and set the default for future rows
  ALTER TABLE "orders_articles" 
  ALTER COLUMN "article_montant_discounted" SET NOT NULL,
  ALTER COLUMN "article_montant_discounted" SET DEFAULT 0;
`);
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`

ALTER TABLE "orders_articles" DROP COLUMN IF EXISTS "article_montant_discounted";`);
}
