import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'
import { migratePostgresV2toV3 } from '@payloadcms/db-postgres/migration-utils'

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
     await migratePostgresV2toV3({
          // enables logging of changes that will be made to the database
          debug: false,
          payload,
          req,
          })
  
}

export async function down({ payload, req }: MigrateDownArgs): Promise<void> {
    // Migration code
}
