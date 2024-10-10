import { MigrateUpArgs, MigrateDownArgs } from "@payloadcms/db-postgres";
import { sql } from "drizzle-orm";

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`

ALTER TABLE "offers" ADD COLUMN "nb_of_eligible_stores" numeric;
ALTER TABLE "offers_rels" ADD COLUMN "media_id" integer;
DO $$ BEGIN
 ALTER TABLE "offers_rels" ADD CONSTRAINT "offers_rels_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
`);
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`

ALTER TABLE "offers_rels" DROP CONSTRAINT "offers_rels_media_id_media_id_fk";

ALTER TABLE "offers" DROP COLUMN IF EXISTS "nb_of_eligible_stores";
ALTER TABLE "offers_rels" DROP COLUMN IF EXISTS "media_id";`);
}
