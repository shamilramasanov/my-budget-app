/*
  Warnings:

  - You are about to drop the `Vehicle` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX "Vehicle_vin_key";

-- AlterTable
ALTER TABLE "Specification" ADD COLUMN "section" TEXT;
ALTER TABLE "Specification" ADD COLUMN "serviceCount" INTEGER;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Vehicle";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Contract" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "number" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dkCode" TEXT NOT NULL,
    "dkName" TEXT NOT NULL,
    "contractor" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL,
    "budgetId" TEXT NOT NULL,
    "kekvId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Contract_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "Budget" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Contract_kekvId_fkey" FOREIGN KEY ("kekvId") REFERENCES "KEKV" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Contract_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Contract" ("amount", "budgetId", "contractor", "createdAt", "dkCode", "dkName", "endDate", "id", "kekvId", "name", "number", "startDate", "status", "updatedAt", "userId") SELECT "amount", "budgetId", "contractor", "createdAt", "dkCode", "dkName", "endDate", "id", "kekvId", "name", "number", "startDate", "status", "updatedAt", "userId" FROM "Contract";
DROP TABLE "Contract";
ALTER TABLE "new_Contract" RENAME TO "Contract";
CREATE TABLE "new_KEKV" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "plannedAmount" REAL NOT NULL,
    "usedAmount" REAL NOT NULL DEFAULT 0,
    "budgetId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "KEKV_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "Budget" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_KEKV" ("budgetId", "code", "createdAt", "id", "name", "plannedAmount", "updatedAt", "usedAmount") SELECT "budgetId", "code", "createdAt", "id", "name", "plannedAmount", "updatedAt", "usedAmount" FROM "KEKV";
DROP TABLE "KEKV";
ALTER TABLE "new_KEKV" RENAME TO "KEKV";
CREATE UNIQUE INDEX "KEKV_code_budgetId_key" ON "KEKV"("code", "budgetId");
CREATE TABLE "new_Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "amount" REAL NOT NULL,
    "date" DATETIME NOT NULL,
    "description" TEXT,
    "contractId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Payment_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Payment" ("amount", "contractId", "createdAt", "date", "description", "id", "updatedAt") SELECT "amount", "contractId", "createdAt", "date", "description", "id", "updatedAt" FROM "Payment";
DROP TABLE "Payment";
ALTER TABLE "new_Payment" RENAME TO "Payment";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
