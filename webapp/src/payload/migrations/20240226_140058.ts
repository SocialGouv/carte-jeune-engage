import { MigrateUpArgs, MigrateDownArgs } from "@payloadcms/db-postgres";
import { sql } from "drizzle-orm";

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`

ALTER TABLE "permissions" ALTER COLUMN "phone_number" SET NOT NULL;`);
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`

ALTER TABLE "permissions" ALTER COLUMN "phone_number" DROP NOT NULL;`);
}
