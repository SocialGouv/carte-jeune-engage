import { MigrateUpArgs, MigrateDownArgs } from "@payloadcms/db-postgres";
import { sql } from "drizzle-orm";

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`

ALTER TABLE "savings" ALTER COLUMN "amount" SET NOT NULL;
ALTER TABLE "users" ADD COLUMN "phone_number" varchar;
ALTER TABLE "users" ADD COLUMN "address" varchar;`);
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`

ALTER TABLE "savings" ALTER COLUMN "amount" DROP NOT NULL;
ALTER TABLE "users" DROP COLUMN IF EXISTS "phone_number";
ALTER TABLE "users" DROP COLUMN IF EXISTS "address";`);
}
