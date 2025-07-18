import { it, describe, expect, vi, beforeEach } from "vitest";

import { storeAndUpdatePosts, type Post } from "./posts";
import prisma from "@/db";
import { threadId } from "worker_threads";

vi.mock("@/db", () => ({
  default: {
    posts: {
      create: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

describe("storeAndUpdatePosts", () => {
  const mockedPostsToUpdate: Post[] = [
    {
      id: "456",
      finolierId: "finolier-2",
      createdAt: new Date("2025-07-15T10:30:00Z"),
      threadId: "thread-2",
      message: "updated post message",
      likes: 5,
      dislikes: 2,
    },
    {
      id: "789",
      finolierId: "finolier-3",
      createdAt: new Date("2025-07-16T14:20:00Z"),
      threadId: "thread-3",
      message: "another updated post",
      likes: 3,
      dislikes: 0,
    },
  ];

  const mockedPostsToCreate: Post[] = [
    {
      id: "123",
      finolierId: "finolier-1",
      createdAt: new Date(),
      threadId: "thread-1",
      message: "post message 1",
      likes: 0,
      dislikes: 1,
    },
    {
      id: "234",
      finolierId: "finolier-4",
      createdAt: new Date("2025-07-17T09:15:00Z"),
      threadId: "thread-1",
      message: "new post in same thread",
      likes: 2,
      dislikes: 0,
    },
    {
      id: "345",
      finolierId: "finolier-5",
      createdAt: new Date("2025-07-18T11:45:00Z"),
      threadId: "thread-4",
      message: "completely new post in new thread",
      likes: 1,
      dislikes: 3,
    },
  ];

  it("calls the database with the array of posts to create and update", async () => {
    vi.mocked(prisma.posts.create).mockResolvedValue({
      id: "234",
      finolierId: "finolier-4",
      createdAt: new Date("2025-07-17T09:15:00Z"),
      threadId: "thread-1",
      message: "new post in same thread",
      likes: 2,
      dislikes: 0,
      popularity: 2,
    });

    vi.mocked(prisma.posts.update).mockResolvedValue({
      id: "234",
      finolierId: "finolier-4",
      createdAt: new Date("2025-07-17T09:15:00Z"),
      threadId: "thread-1",
      message: "new post in same thread",
      likes: 2,
      dislikes: 0,
      popularity: 2,
    });

    vi.mocked(prisma.$transaction).mockResolvedValue({ success: true });

    await storeAndUpdatePosts(mockedPostsToCreate, mockedPostsToUpdate);

    expect(prisma.posts.create).toHaveBeenCalledTimes(3);

    mockedPostsToCreate.forEach((post) => {
      expect(prisma.posts.create).toHaveBeenCalledWith({
        data: { ...post, popularity: post.likes + post.dislikes },
      });
    });
    expect(prisma.posts.update).toHaveBeenCalledTimes(2);
    mockedPostsToUpdate.forEach((post) => {
      expect(prisma.posts.update).toHaveBeenCalledWith({
        where: { id: post.id },
        data: { ...post, popularity: post.likes + post.dislikes },
      });
    });
  });
});
