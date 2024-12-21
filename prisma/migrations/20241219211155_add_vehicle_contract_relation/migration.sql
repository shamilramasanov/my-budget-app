-- CreateTable
CREATE TABLE "_ContractToVehicle" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_ContractToVehicle_A_fkey" FOREIGN KEY ("A") REFERENCES "Contract" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ContractToVehicle_B_fkey" FOREIGN KEY ("B") REFERENCES "Vehicle" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Vehicle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "model" TEXT NOT NULL,
    "militaryNumber" TEXT NOT NULL,
    "vin" TEXT NOT NULL,
    "location" TEXT,
    "year" INTEGER,
    "status" TEXT,
    "notes" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Vehicle_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Vehicle" ("createdAt", "id", "location", "militaryNumber", "model", "notes", "status", "updatedAt", "userId", "vin", "year") SELECT "createdAt", "id", "location", "militaryNumber", "model", "notes", "status", "updatedAt", "userId", "vin", "year" FROM "Vehicle";
DROP TABLE "Vehicle";
ALTER TABLE "new_Vehicle" RENAME TO "Vehicle";
CREATE UNIQUE INDEX "Vehicle_vin_key" ON "Vehicle"("vin");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "_ContractToVehicle_AB_unique" ON "_ContractToVehicle"("A", "B");

-- CreateIndex
CREATE INDEX "_ContractToVehicle_B_index" ON "_ContractToVehicle"("B");
