/*
  Warnings:

  - You are about to drop the column `numLikesRecieved` on the `Finoliers` table. All the data in the column will be lost.
  - Added the required column `numLikesReceived` to the `Finoliers` table without a default value. This is not possible if the table is not empty.
  - Made the column `reputation` on table `Finoliers` required. This step will fail if there are existing NULL values in that column.

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
    "reputation" REAL NOT NULL,
    "numLikesReceived" INTEGER NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Finoliers" ("about", "avatar", "createdAt", "displayName", "id", "location", "numFollowers", "numFollowing", "numPosts", "reputation", "updatedAt") SELECT "about", "avatar", "createdAt", "displayName", "id", "location", "numFollowers", "numFollowing", "numPosts", "reputation", "updatedAt" FROM "Finoliers";
DROP TABLE "Finoliers";
ALTER TABLE "new_Finoliers" RENAME TO "Finoliers";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
