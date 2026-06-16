/*
  Warnings:

  - You are about to drop the column `cancelReason` on the `Sale` table. All the data in the column will be lost.
  - You are about to drop the column `cancelledAt` on the `Sale` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `Sale` table. All the data in the column will be lost.
  - You are about to drop the column `productName` on the `Sale` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `Sale` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Sale` table. All the data in the column will be lost.
  - You are about to drop the column `unitPrice` on the `Sale` table. All the data in the column will be lost.
  - Added the required column `paymentMethod` to the `Sale` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('EFECTIVO', 'TRANSFERENCIA', 'TARJETA');

-- DropForeignKey
ALTER TABLE "Sale" DROP CONSTRAINT "Sale_productId_fkey";

-- DropIndex
DROP INDEX "Sale_productId_idx";

-- DropIndex
DROP INDEX "Sale_status_idx";

-- AlterTable
ALTER TABLE "Sale" DROP COLUMN "cancelReason",
DROP COLUMN "cancelledAt",
DROP COLUMN "productId",
DROP COLUMN "productName",
DROP COLUMN "quantity",
DROP COLUMN "status",
DROP COLUMN "unitPrice",
ADD COLUMN     "paymentMethod" "PaymentMethod" NOT NULL;

-- DropEnum
DROP TYPE "SaleStatus";

-- CreateTable
CREATE TABLE "SaleDetail" (
    "id" TEXT NOT NULL,
    "saleId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SaleDetail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SaleDetail_saleId_idx" ON "SaleDetail"("saleId");

-- CreateIndex
CREATE INDEX "SaleDetail_productId_idx" ON "SaleDetail"("productId");

-- AddForeignKey
ALTER TABLE "SaleDetail" ADD CONSTRAINT "SaleDetail_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleDetail" ADD CONSTRAINT "SaleDetail_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
