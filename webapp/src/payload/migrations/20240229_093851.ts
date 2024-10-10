import { MigrateUpArgs, MigrateDownArgs } from "@payloadcms/db-postgres";
import { sql } from "drizzle-orm";

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`

ALTER TYPE "enum_offers_kind" ADD VALUE 'voucher_pass';
ALTER TYPE "enum_offers_kind" ADD VALUE 'code_space';`);
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  // Migration code
}
