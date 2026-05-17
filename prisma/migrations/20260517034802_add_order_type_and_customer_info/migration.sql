-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "customerName" TEXT NOT NULL DEFAULT 'Pelanggan Umum',
ADD COLUMN     "orderType" TEXT NOT NULL DEFAULT 'DINE_IN',
ADD COLUMN     "tableNumber" TEXT;
