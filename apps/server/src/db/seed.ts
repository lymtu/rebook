import { hash } from '@node-rs/bcrypt';
import { db } from './client';
import { feeProposals } from './schema/fee-proposals';
import { users } from './schema/users';
import { logger } from '../lib/logger';

async function seed() {
  const passwordHash = await hash('password123', 10);

  await db
    .insert(users)
    .values([
      {
        id: '01J0000000000000000000SUPR',
        username: 'superadmin',
        passwordHash,
        nickname: '超级管理员',
        role: 'super_admin',
        status: 'active',
      },
      {
        id: '01J0000000000000000000ADMN',
        username: 'admin',
        passwordHash,
        nickname: '管理员',
        role: 'admin',
        status: 'active',
      },
      {
        id: '01J0000000000000000000USER',
        username: 'demo',
        passwordHash,
        nickname: '演示用户',
        role: 'user',
        status: 'active',
      },
    ])
    .onConflictDoNothing();

  await db
    .insert(feeProposals)
    .values({
      id: '01J000000000000000000FEE01',
      rateBps: 500,
      status: 'approved',
      proposedByUserId: '01J0000000000000000000ADMN',
      reviewedByUserId: '01J0000000000000000000SUPR',
      reviewedAt: new Date(),
      reviewNote: 'seed',
    })
    .onConflictDoNothing();

  logger.info('Seed complete.');
}

if (import.meta.main) {
  seed()
    .then(() => process.exit(0))
    .catch((err) => {
      logger.error({ err }, 'Seed failed');
      process.exit(1);
    });
}
