import { MigrateUpArgs, MigrateDownArgs } from "@payloadcms/db-postgres";
import { sql } from "drizzle-orm";

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`

ALTER TABLE "partners" ALTER COLUMN "description" DROP NOT NULL;
ALTER TABLE "partners" ALTER COLUMN "url" DROP NOT NULL;
ALTER TABLE "offers" ADD COLUMN "url" varchar;`);
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`

ALTER TABLE "partners" ALTER COLUMN "description" SET NOT NULL;
ALTER TABLE "partners" ALTER COLUMN "url" SET NOT NULL;
ALTER TABLE "offers" DROP COLUMN IF EXISTS "url";`);
}
