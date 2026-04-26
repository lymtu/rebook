import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { env } from '../env';
import { logger } from '../lib/logger';

async function main() {
  const client = postgres(env.DATABASE_URL, { max: 1 });
  const db = drizzle(client);
  logger.info('Running database migrations...');
  await migrate(db, { migrationsFolder: './drizzle' });
  await client.end();
  logger.info('Migrations complete.');
}

main().catch((err) => {
  logger.error({ err }, 'Migration failed');
  process.exit(1);
});
