import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from 'drizzle-orm'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
await payload.db.drizzle.execute(sql`

ALTER TABLE "orders" ADD COLUMN "used" boolean;
ALTER TABLE "orders" ADD COLUMN "used_at" timestamp(3) with time zone;`);

};

export async function down({ payload }: MigrateDownArgs): Promise<void> {
await payload.db.drizzle.execute(sql`

ALTER TABLE "orders" DROP COLUMN IF EXISTS "used";
ALTER TABLE "orders" DROP COLUMN IF EXISTS "used_at";`);

};
