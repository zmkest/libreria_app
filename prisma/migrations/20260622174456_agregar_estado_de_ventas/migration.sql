-- CreateEnum
CREATE TYPE "SaleStatus" AS ENUM ('BORRADOR', 'PAGADA', 'ANULADA');

-- AlterTable
ALTER TABLE "Sale" ADD COLUMN     "cancellationReason" TEXT,
ADD COLUMN     "cancelledAt" TIMESTAMP(3),
ADD COLUMN     "cancelledById" TEXT,
ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "status" "SaleStatus" NOT NULL DEFAULT 'BORRADOR';

-- Migración de datos: ventas existentes pasan a PAGADA con paidAt = createdAt
UPDATE "Sale" SET "status" = 'PAGADA'::"SaleStatus", "paidAt" = "createdAt";

-- CreateIndex
CREATE INDEX "Sale_cancelledById_idx" ON "Sale"("cancelledById");

-- CreateIndex
CREATE INDEX "Sale_status_idx" ON "Sale"("status");

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_cancelledById_fkey" FOREIGN KEY ("cancelledById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
