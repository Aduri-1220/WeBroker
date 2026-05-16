/**
 * Legacy additive fixes (`ALTER TABLE ... IF NOT EXISTS`) for databases that drifted
 * before migrations were standardized. Prefer `npm run db:migrate` (migrate deploy)
 * and tracked SQL under prisma/migrations — do not rely on this for new environments.
 *
 * Usage: npm run db:ensure-columns
 */
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe(
    `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "phone" TEXT`,
  );
  await prisma.$executeRawUnsafe(
    `ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "method" TEXT`,
  );
  await prisma.$executeRawUnsafe(
    `ALTER TABLE "Delivery" ADD COLUMN IF NOT EXISTS "scannedCopyBlob" BYTEA`,
  );
  await prisma.$executeRawUnsafe(
    `ALTER TABLE "Delivery" ADD COLUMN IF NOT EXISTS "scannedCopyMime" TEXT`,
  );
  await prisma.$executeRawUnsafe(
    `ALTER TABLE "Delivery" ADD COLUMN IF NOT EXISTS "scannedCopyOriginalName" TEXT`,
  );
  await prisma.$executeRawUnsafe(
    `ALTER TABLE "Delivery" ADD COLUMN IF NOT EXISTS "scannedCopyUploadedAt" TIMESTAMP(3)`,
  );
  console.log(
    'Ensured columns: "User"."phone", "Payment"."method", "Delivery" scanned-copy fields.',
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
