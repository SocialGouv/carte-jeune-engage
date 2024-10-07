import { MigrateUpArgs, MigrateDownArgs } from "@payloadcms/db-postgres";
import { sql } from "drizzle-orm";

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`

CREATE TABLE IF NOT EXISTS "offers_condition_blocks" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"text" varchar NOT NULL
);

ALTER TABLE "media" ADD COLUMN "focal_x" numeric;
ALTER TABLE "media" ADD COLUMN "focal_y" numeric;
CREATE INDEX IF NOT EXISTS "offers_condition_blocks_order_idx" ON "offers_condition_blocks" ("_order");
CREATE INDEX IF NOT EXISTS "offers_condition_blocks_parent_id_idx" ON "offers_condition_blocks" ("_parent_id");
DO $$ BEGIN
 ALTER TABLE "offers_condition_blocks" ADD CONSTRAINT "offers_condition_blocks__parent_id_offers_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "offers"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
`);
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`

DROP TABLE "offers_condition_blocks";
ALTER TABLE "media" DROP COLUMN IF EXISTS "focal_x";
ALTER TABLE "media" DROP COLUMN IF EXISTS "focal_y";`);
}
