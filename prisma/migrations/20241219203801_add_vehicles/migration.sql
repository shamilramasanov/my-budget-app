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

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_vin_key" ON "Vehicle"("vin");
