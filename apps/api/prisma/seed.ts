import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 12);

  const testUser = await prisma.user.upsert({
    where: { email: 'test@trendvault.dev' },
    update: {},
    create: {
      email: 'test@trendvault.dev',
      password: hashedPassword,
      name: 'Test User',
    },
  });

  console.log('Seed completed:', testUser);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
