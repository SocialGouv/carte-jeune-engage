import { MigrateUpArgs, MigrateDownArgs } from "@payloadcms/db-postgres";
import { sql } from "drizzle-orm";

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`

DO $$ BEGIN
 CREATE TYPE "enum_offers_barcode_format" AS ENUM('CODE39', 'EAN13', 'ITF14', 'MSI', 'pharmacode', 'codabar', 'upc');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "offers" ADD COLUMN "barcodeFormat" "enum_offers_barcode_format";`);
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`

ALTER TABLE "offers" DROP COLUMN IF EXISTS "barcodeFormat";`);
}
