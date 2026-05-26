import { PrismaClient, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const { DEFAULT_ROLE_PERMISSIONS } = require('../src/roles/permissions.constants');

const roles = [
  {
    name: 'Super Admin',
    description: 'Full platform access, including user and system management.',
  },
  {
    name: 'Admin',
    description: 'Administrative access for day-to-day CMS operations.',
  },
  {
    name: 'Editor',
    description: 'Creates and edits CMS content.',
  },
  {
    name: 'Reviewer',
    description: 'Reviews submitted content before approval.',
  },
  {
    name: 'Publisher',
    description: 'Publishes approved content.',
  },
  {
    name: 'Viewer',
    description: 'Read-only access to CMS content and reports.',
  },
];

function loadEnvFile() {
  const candidates = [resolve(process.cwd(), '.env'), resolve(process.cwd(), '../../.env')];
  const envPath = candidates.find((candidate) => existsSync(candidate));

  if (!envPath) {
    return;
  }

  for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);

    if (!match) {
      continue;
    }

    const [, key, rawValue] = match;
    const value = rawValue.replace(/^"|"$/g, '');

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

async function main() {
  loadEnvFile();
  const prisma = new PrismaClient();

  try {
    for (const role of roles) {
      const permissions = DEFAULT_ROLE_PERMISSIONS[role.name] ?? [];
      await prisma.role.upsert({
        where: { name: role.name },
        update: {
          description: role.description,
          isSystemRole: true,
          permissions,
        },
        create: {
          name: role.name,
          description: role.description,
          isSystemRole: true,
          permissions,
          status: UserStatus.ACTIVE,
        },
      });
    }

    const superAdminRole = await prisma.role.findUniqueOrThrow({
      where: { name: 'Super Admin' },
    });

    const email = process.env.DEFAULT_SUPER_ADMIN_EMAIL ?? 'admin@example.com';
    const name = process.env.DEFAULT_SUPER_ADMIN_NAME ?? 'Super Admin';
    const password = process.env.DEFAULT_SUPER_ADMIN_PASSWORD ?? 'Admin@12345';
    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.user.upsert({
      where: { email },
      update: {
        name,
        passwordHash,
        roleId: superAdminRole.id,
        status: UserStatus.ACTIVE,
      },
      create: {
        email,
        name,
        passwordHash,
        roleId: superAdminRole.id,
        status: UserStatus.ACTIVE,
      },
    });

    console.log(`Seeded ${roles.length} roles with permissions and Super Admin user: ${email}`);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
