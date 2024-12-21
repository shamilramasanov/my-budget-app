-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Budget" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "date" DATETIME NOT NULL,
    "description" TEXT,
    "totalAmount" REAL NOT NULL,
    "usedAmount" REAL NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Budget_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "KEKV" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "plannedAmount" REAL NOT NULL,
    "usedAmount" REAL NOT NULL DEFAULT 0,
    "budgetId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "KEKV_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "Budget" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Contract" (
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
    CONSTRAINT "Contract_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "Budget" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Contract_kekvId_fkey" FOREIGN KEY ("kekvId") REFERENCES "KEKV" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Contract_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Specification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "price" REAL NOT NULL,
    "amount" REAL NOT NULL,
    "contractId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Specification_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "amount" REAL NOT NULL,
    "date" DATETIME NOT NULL,
    "description" TEXT,
    "contractId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Payment_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "KEKV_code_budgetId_key" ON "KEKV"("code", "budgetId");
