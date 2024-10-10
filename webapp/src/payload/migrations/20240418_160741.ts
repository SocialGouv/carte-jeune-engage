import { MigrateUpArgs, MigrateDownArgs } from "@payloadcms/db-postgres";
import { sql } from "drizzle-orm";

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`

ALTER TABLE "notifications_rels" ADD COLUMN "offers_id" integer;
DO $$ BEGIN
 ALTER TABLE "notifications_rels" ADD CONSTRAINT "notifications_rels_offers_id_offers_id_fk" FOREIGN KEY ("offers_id") REFERENCES "offers"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
`);
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`

ALTER TABLE "notifications_rels" DROP CONSTRAINT "notifications_rels_offers_id_offers_id_fk";

ALTER TABLE "notifications_rels" DROP COLUMN IF EXISTS "offers_id";`);
}
