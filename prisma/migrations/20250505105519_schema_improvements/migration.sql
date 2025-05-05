-- CreateTable
CREATE TABLE "Votes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "finolierId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "vote" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Votes_finolierId_fkey" FOREIGN KEY ("finolierId") REFERENCES "Finoliers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Votes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Users" (
    "id" TEXT NOT NULL PRIMARY KEY
);

-- CreateTable
CREATE TABLE "Tags" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "finolierId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Tags_finolierId_fkey" FOREIGN KEY ("finolierId") REFERENCES "Finoliers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Tags_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Tags_finolierId_idx" ON "Tags"("finolierId");

-- CreateIndex
CREATE INDEX "Tags_userId_idx" ON "Tags"("userId");
