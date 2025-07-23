import { it, describe, expect, vi, beforeEach } from "vitest";

import {
  storeAndUpdatePosts,
  fetchFinolierPosts,
  getPostsToCreate,
  fetchGreatestPostsDB,
  fetchRecentGreatestPostsDB,
  updateFinoliersPosts,
  type Post,
} from "./posts";

vi.mock("@/db", () => ({
  default: {
    posts: {
      create: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn(),
    },
    finoliers: {
      findMany: vi.fn(),
      updateMany: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));
import prisma from "@/db";

vi.mock("@/actions", async () => {
  const actual = await vi.importActual("@/actions");
  return {
    ...actual,
    fetchLatestThreads: vi.fn(),
    fetchThread: vi.fn(),
    getMissingThreadIds: vi.fn(),
    storeThreads: vi.fn(),
  };
});

import {
  fetchLatestThreads,
  storeThreads,
  fetchThread,
  getMissingThreadIds,
} from "@/actions";

const mockFetch = vi.fn().mockResolvedValue({
  ok: true,
  json: vi.fn().mockResolvedValue({
    response: [
      {
        id: "123",
        createdAt: new Date(),
        thread: "thread test",
        raw_message: "test raw message",
        likes: 1,
        dislikes: 0,
        parent: 123,
      },
      {
        id: "456",
        createdAt: new Date("2025-07-18"),
        thread: "thread test 2",
        raw_message: "test raw message 2",
        likes: 1,
        dislikes: 0,
        parent: null,
      },
    ],
  }),
});

beforeEach(() => {
  vi.clearAllMocks();
});

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

describe("fetchFinolierPosts", () => {
  it("makes the API request with the right parameters", async () => {
    vi.stubGlobal("fetch", mockFetch);

    const finolierId = "finolierId";
    const limit = 11;
    await fetchFinolierPosts(finolierId, limit);

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining(`user=username%3A${finolierId}`),
      expect.objectContaining({
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })
    );

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining(`limit=${limit}`),
      expect.any(Object)
    );
  });

  it("returns filtered posts in the right format", async () => {
    const finolierId = "finolierId";
    const limit = 11;
    const result = await fetchFinolierPosts(finolierId, limit);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: "456",
      finolierId: "finolierId",
      createdAt: expect.any(Date),
      threadId: "thread test 2",
      message: "test raw message 2",
      likes: 1,
      dislikes: 0,
    });
  });
});

describe("getPostsToCreate", () => {
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

  it("splits the list of posts into two groups", async () => {
    vi.mocked(prisma.posts.findMany).mockResolvedValue([{ id: "234" }]);

    const { postsToCreate, postsToUpdate } = await getPostsToCreate(
      mockedPostsToCreate
    );

    expect(postsToUpdate).toHaveLength(1);
    expect(postsToUpdate[0]).toEqual(mockedPostsToCreate[1]);

    expect(postsToCreate).toHaveLength(2);
    expect(postsToCreate[1]).toEqual(mockedPostsToCreate[2]);
  });
});

describe("fetchGreatestPostsDB", () => {
  const finolierId = "finolier1";
  const mockedPost = {
    id: "456",
    finolierId: "finolier-2",
    createdAt: new Date("2025-07-15T10:30:00Z"),
    threadId: "thread-2",
    message: "updated post message",
    likes: 5,
    dislikes: 2,
    popularity: 7,
  };
  it("queries de db with the right id", async () => {
    await fetchGreatestPostsDB(finolierId);

    expect(prisma.posts.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          finolierId,
        },
        orderBy: {
          popularity: "desc",
        },
      })
    );
    expect(prisma.posts.findMany).toHaveBeenCalledOnce();
  });

  it("returns a list of posts", async () => {
    vi.mocked(prisma.posts.findMany).mockResolvedValue([mockedPost]);
    const posts = await fetchGreatestPostsDB(finolierId);

    expect(posts).toHaveLength(1);
    expect(posts[0]).toEqual(mockedPost);
  });
});

describe("fetchRecentGreatestPostsDB", () => {
  const mockedPost = {
    id: "postid",
    finolierId: "finolier-2",
    createdAt: new Date("2025-07-15T10:30:00Z"),
    threadId: "thread-2",
    message: "updated post message",
    likes: 5,
    dislikes: 2,
    popularity: 7,
  };
  it("queries de db with the right query", async () => {
    await fetchRecentGreatestPostsDB();

    expect(prisma.posts.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          createdAt: expect.objectContaining({ gte: expect.any(Date) }),
        },
        orderBy: {
          popularity: "desc",
        },
        take: 25,
      })
    );
    expect(prisma.posts.findMany).toHaveBeenCalledOnce();
  });

  it("returns a list of posts", async () => {
    vi.mocked(prisma.posts.findMany).mockResolvedValue([mockedPost]);
    const posts = await fetchRecentGreatestPostsDB();
    console.log(posts);
    expect(posts).toHaveLength(1);
    expect(posts[0]).toEqual(mockedPost);
  });
});

describe("updateFinoliersPosts", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(fetchLatestThreads).mockResolvedValue({
      success: true,
      message: "Threads fetched successfully",
      threads: [
        {
          id: "thread1",
          title: "Test Thread",
          link: "https://example.com",
          createdAt: new Date(),
        },
      ],
    });

    vi.mocked(storeThreads).mockResolvedValue({ success: true });
    vi.mocked(getMissingThreadIds).mockResolvedValue([]);
    vi.mocked(fetchThread).mockResolvedValue({
      success: true,
      message: "Thread fetched",
      thread: {
        id: "thread1",
        title: "Test Thread",
        link: "https://example.com",
        createdAt: new Date(),
      },
    });
  });
  vi.stubGlobal("fetch", mockFetch);

  it("doesn't update anything if last update time under 24 hours", async () => {
    vi.mocked(prisma.finoliers.findMany).mockResolvedValue([
      { id: "123", lastPostsUpdate: new Date(Date.now() - 5 * 60 * 60 * 1000) },
      { id: "456", lastPostsUpdate: new Date(Date.now() - 1 * 60 * 60 * 1000) },
    ]);
    const result = await updateFinoliersPosts(["123", "456"]);

    expect(result.success).toBe(true);
    expect(result.message).toBe(
      "All finolier posts already updated in the last 12 hours"
    );
  });

  it("fetches posts and threads from finoliers that were not updated in the last 12 hours", async () => {
    const postIds = ["123", "789", "456"];
    vi.mocked(prisma.finoliers.findMany).mockResolvedValue([
      {
        id: postIds[0],
        lastPostsUpdate: new Date(Date.now() - 35 * 60 * 60 * 1000),
      },
      {
        id: postIds[1],
        lastPostsUpdate: new Date(Date.now() - 5 * 60 * 60 * 1000),
      },
      { id: postIds[2], lastPostsUpdate: null },
    ]);

    const res = await updateFinoliersPosts(["123", "456"]);

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining(`user=username%3A${postIds[0]}`),
      expect.objectContaining({
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })
    );
    expect(mockFetch).not.toHaveBeenCalledWith(
      expect.stringContaining(`user=username%3A${postIds[1]}`),
      expect.objectContaining({
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })
    );

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining(`user=username%3A${postIds[2]}`),
      expect.objectContaining({
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })
    );

    expect(res.success).toBe(true);

    expect(vi.mocked(storeThreads)).toHaveBeenCalledWith([
      {
        id: "thread1",
        title: "Test Thread",
        link: "https://example.com",
        createdAt: expect.any(Date),
      },
    ]);
  });
});
