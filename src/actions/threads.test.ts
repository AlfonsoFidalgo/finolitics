import { it, describe, expect, vi, beforeEach } from "vitest";
import { storeThreads, fetchThread, type Thread } from "./threads";
import prisma from "@/db";
vi.mock("@/db", () => ({
  default: {
    threads: {
      createMany: vi.fn(),
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

    const testFetch = vi.fn((url, options) => {
      return new Promise((resolve, reject) => {
        const testResponse = {
          ok: true,
          json() {
            return new Promise((response, reject) => {
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

    console.log(result);
    expect(testFetch).toHaveBeenCalledWith(
      expect.stringContaining("thread=123"),
      expect.objectContaining({
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })
    );
    expect(result.success).toBe(true);
    expect(result.thread).toEqual({
      id: responseThread.id,
      title: responseThread.clean_title,
      link: responseThread.link,
      createdAt: responseThread.createdAt,
    });
  });
});
