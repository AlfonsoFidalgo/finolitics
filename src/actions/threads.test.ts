import { it, describe, expect, vi, beforeEach } from "vitest";
import {
  storeThreads,
  fetchThread,
  fetchThreadsDB,
  fetchLatestThreads,
  getMissingThreadIds,
  type Thread,
} from "./threads";
import prisma from "@/db";

vi.mock("@/db", () => ({
  default: {
    threads: {
      createMany: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
    },
  },
}));

describe("storeThreads", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const threads = [
    {
      id: "123",
      title: "test thread",
      link: "www.thread.com",
      createdAt: new Date(),
    },
  ];
  it("stores a list of threads", async () => {
    await storeThreads(threads);

    expect(prisma.threads.createMany).toHaveBeenCalledWith({
      data: threads as Thread[],
    });
    expect(prisma.threads.createMany).toHaveBeenCalledTimes(1);
  });
});

describe("fetchThread", () => {
  it("makes an API call and returns the correct format", async () => {
    const responseThread = {
      id: "123",
      clean_title: "test thread",
      link: "www.test.com",
      createdAt: new Date(),
    };

    const testFetch = vi.fn(() => {
      return new Promise((resolve) => {
        const testResponse = {
          ok: true,
          json() {
            return new Promise((response) => {
              response({
                response: responseThread,
              });
            });
          },
        };
        resolve(testResponse);
      });
    });
    vi.stubGlobal("fetch", testFetch);

    const result = await fetchThread("123");

    expect(testFetch).toHaveBeenCalledWith(
      expect.stringContaining("thread=123"),
      expect.objectContaining({
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })
    );
    expect(result.success).toBe(true);
    expect(result.message).toBe("Thread encontrado");
    expect(result.thread).toEqual({
      id: responseThread.id,
      title: responseThread.clean_title,
      link: responseThread.link,
      createdAt: responseThread.createdAt,
    });
  });
});

describe("fetchThreadsDB", () => {
  it("passes the right arguments to the DB", async () => {
    const threadIds = ["123", "456"];
    await fetchThreadsDB(threadIds);

    expect(prisma.threads.findMany).toHaveBeenCalledWith({
      where: {
        id: {
          in: threadIds,
        },
      },
    });
  });
});

describe("fetchLatestThreads", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("makes a GET request to the API with the right parameters", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        response: [
          {
            id: "123",
            clean_title: "test title",
            link: "www.test.com",
            createdAt: new Date(),
          },
        ],
      }),
    });

    vi.stubGlobal("fetch", mockFetch);

    await fetchLatestThreads(30, "some-forum");

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("forum=some-forum&limit=30"),
      expect.objectContaining({
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })
    );
  });

  it("returns threads that are not already in the database", async () => {
    const responseThreads = [
      {
        id: "123",
        clean_title: "test title",
        link: "www.test.com",
        createdAt: new Date("2025-07-16"),
      },
      {
        id: "456",
        clean_title: "test title 2",
        link: "www.test.com",
        createdAt: new Date("2025-07-01"),
      },
    ];
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        response: responseThreads,
      }),
    });

    vi.stubGlobal("fetch", mockFetch);

    // Most recent thread mock
    vi.mocked(prisma.threads.findFirst).mockResolvedValue({
      id: "5743",
      clean_title: "test title",
      link: "www.test.com",
      createdAt: new Date("2025-07-10"),
    });

    const result = await fetchLatestThreads(30, "some-forum");

    // One thread should be filtered out
    expect(result.threads).toHaveLength(1);
    expect(result.threads[0]).toMatchObject({ id: "123" });
  });
});

describe("getMissingThreadIds", () => {
  const mockedPosts = [
    {
      id: "123",
      finolierId: "abc",
      createdAt: new Date(),
      threadId: "thread-1",
      message: "test message 1",
      likes: 1,
      dislikes: 0,
    },
    {
      id: "456",
      finolierId: "abc",
      createdAt: new Date(),
      threadId: "thread-1",
      message: "test message 1",
      likes: 1,
      dislikes: 0,
    },
    {
      id: "789",
      finolierId: "abc",
      createdAt: new Date(),
      threadId: "thread-2",
      message: "test message 1",
      likes: 1,
      dislikes: 0,
    },
  ];
  it("given a list of posts, returns the threads that are not in the database", async () => {
    // thread-2 in database already
    vi.mocked(prisma.threads.findMany).mockResolvedValue([{ id: "thread-2" }]);

    const response = await getMissingThreadIds(mockedPosts);

    // call with unique thread ids
    expect(prisma.threads.findMany).toHaveBeenCalledWith({
      where: { id: { in: ["thread-1", "thread-2"] } },
      select: { id: true },
    });

    //return only thread-1 because not in db
    expect(response).toEqual(["thread-1"]);
  });
});
