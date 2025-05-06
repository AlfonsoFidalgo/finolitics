-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Votes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "finolierId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "vote" TEXT NOT NULL DEFAULT 'unknown',
    "userId" TEXT NOT NULL,
    CONSTRAINT "Votes_finolierId_fkey" FOREIGN KEY ("finolierId") REFERENCES "Finoliers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Votes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Votes" ("createdAt", "finolierId", "id", "userId", "vote") SELECT "createdAt", "finolierId", "id", "userId", "vote" FROM "Votes";
DROP TABLE "Votes";
ALTER TABLE "new_Votes" RENAME TO "Votes";
CREATE UNIQUE INDEX "Votes_userId_finolierId_key" ON "Votes"("userId", "finolierId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
