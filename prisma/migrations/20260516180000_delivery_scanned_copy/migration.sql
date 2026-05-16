-- AlterTable
ALTER TABLE "Delivery" ADD COLUMN     "scannedCopyBlob" BYTEA,
ADD COLUMN     "scannedCopyMime" TEXT,
ADD COLUMN     "scannedCopyOriginalName" TEXT,
ADD COLUMN     "scannedCopyUploadedAt" TIMESTAMP(3);
