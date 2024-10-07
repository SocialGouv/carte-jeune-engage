import { MigrateUpArgs, MigrateDownArgs } from "@payloadcms/db-postgres";
import { sql } from "drizzle-orm";

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`

CREATE TABLE IF NOT EXISTS "offers_conditions" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"text" varchar NOT NULL
);

CREATE INDEX IF NOT EXISTS "_order_idx" ON "offers_conditions" ("_order");
CREATE INDEX IF NOT EXISTS "_parent_id_idx" ON "offers_conditions" ("_parent_id");
DO $$ BEGIN
 ALTER TABLE "offers_conditions" ADD CONSTRAINT "offers_conditions__parent_id_offers_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "offers"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
`);
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`

DROP TABLE "offers_conditions";`);
}
