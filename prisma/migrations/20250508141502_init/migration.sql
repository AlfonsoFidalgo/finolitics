-- CreateEnum
CREATE TYPE "VoteType" AS ENUM ('like', 'dislike', 'unknown');

-- CreateTable
CREATE TABLE "Finoliers" (
    "id" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "avatar" TEXT NOT NULL,
    "about" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "numFollowers" INTEGER NOT NULL,
    "numFollowing" INTEGER NOT NULL,
    "numPosts" INTEGER NOT NULL,
    "reputation" DOUBLE PRECISION NOT NULL,
    "numLikesReceived" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Finoliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Votes" (
    "id" TEXT NOT NULL,
    "finolierId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "vote" "VoteType" NOT NULL DEFAULT 'unknown',
    "userId" TEXT NOT NULL,

    CONSTRAINT "Votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Users" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "finolierId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tags_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Votes_userId_finolierId_key" ON "Votes"("userId", "finolierId");

-- CreateIndex
CREATE INDEX "Tags_finolierId_idx" ON "Tags"("finolierId");

-- CreateIndex
CREATE INDEX "Tags_userId_idx" ON "Tags"("userId");

-- AddForeignKey
ALTER TABLE "Votes" ADD CONSTRAINT "Votes_finolierId_fkey" FOREIGN KEY ("finolierId") REFERENCES "Finoliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Votes" ADD CONSTRAINT "Votes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tags" ADD CONSTRAINT "Tags_finolierId_fkey" FOREIGN KEY ("finolierId") REFERENCES "Finoliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tags" ADD CONSTRAINT "Tags_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
