import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from 'drizzle-orm'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
await payload.db.drizzle.execute(sql`

DO $$ BEGIN
 CREATE TYPE "enum_orders_status" AS ENUM('awaiting_payment', 'payment_completed', 'delivered');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "orders" ADD COLUMN "status" "enum_orders_status" NOT NULL;`);

};

export async function down({ payload }: MigrateDownArgs): Promise<void> {
await payload.db.drizzle.execute(sql`

ALTER TABLE "orders" DROP COLUMN IF EXISTS "status";`);

};
