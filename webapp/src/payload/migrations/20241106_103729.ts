import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from 'drizzle-orm'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
await payload.db.drizzle.execute(sql`

ALTER TYPE "enum_orders_status" ADD VALUE 'archived';`);

};

export async function down({ payload }: MigrateDownArgs): Promise<void> {
// Migration code
};
