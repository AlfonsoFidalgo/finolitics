/*
  Warnings:

  - Added the required column `about` to the `Finoliers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `location` to the `Finoliers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `numFollowers` to the `Finoliers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `numFollowing` to the `Finoliers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `numPosts` to the `Finoliers` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Finoliers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "displayName" TEXT NOT NULL,
    "avatar" TEXT NOT NULL,
    "about" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "numFollowers" INTEGER NOT NULL,
    "numFollowing" INTEGER NOT NULL,
    "numPosts" INTEGER NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Finoliers" ("avatar", "createdAt", "displayName", "id", "updatedAt") SELECT "avatar", "createdAt", "displayName", "id", "updatedAt" FROM "Finoliers";
DROP TABLE "Finoliers";
ALTER TABLE "new_Finoliers" RENAME TO "Finoliers";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
