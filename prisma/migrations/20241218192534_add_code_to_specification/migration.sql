/*
  Warnings:

  - Added the required column `code` to the `Specification` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Vehicle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "model" TEXT NOT NULL,
    "militaryNumber" TEXT NOT NULL,
    "vin" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "notes" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Vehicle_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Specification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "price" REAL NOT NULL,
    "amount" REAL NOT NULL,
    "contractId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Specification_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Specification" ("amount", "contractId", "createdAt", "id", "name", "price", "quantity", "unit", "updatedAt") SELECT "amount", "contractId", "createdAt", "id", "name", "price", "quantity", "unit", "updatedAt" FROM "Specification";
DROP TABLE "Specification";
ALTER TABLE "new_Specification" RENAME TO "Specification";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_vin_key" ON "Vehicle"("vin");
