import { it, describe, expect, vi, beforeEach } from "vitest";
import { fetchFinolierVotes, fetchUserVote } from "./votes";
import prisma from "@/db";
vi.mock("@/db", () => ({
  default: {
    votes: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

describe("fetchFinolierVotes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return an object with correct keys", async () => {
    const finolierId = "finolier1";
    const mockVotes = [
      {
        userId: "user1",
        finolierId: "finolier1",
        vote: "like",
        id: "vote1",
        createdAt: new Date(),
      },
    ];
    vi.mocked(prisma.votes.findMany).mockResolvedValue(mockVotes);
    const votes = await fetchFinolierVotes(finolierId);

    expect(votes).toBeDefined();
    expect(votes).toHaveProperty("like");
    expect(votes).toHaveProperty("dislike");
    expect(votes).toHaveProperty("unknown");
  });

  it("should sum the votes correctly", async () => {
    const finolierId = "finolier1";
    const mockedVotes = [
      {
        userId: "user1",
        finolierId: "finolier1",
        vote: "like",
        id: "vote1",
        createdAt: new Date(),
      },
      {
        userId: "user2",
        finolierId: "finolier1",
        vote: "like",
        id: "vote1",
        createdAt: new Date(),
      },
      {
        userId: "user3",
        finolierId: "finolier1",
        vote: "unknown",
        id: "vote2",
        createdAt: new Date(),
      },
    ];

    vi.mocked(prisma.votes.findMany).mockResolvedValue(mockedVotes);
    const votes = await fetchFinolierVotes(finolierId);

    expect(votes).toBeDefined();
    expect(votes?.like).toBe(2);
    expect(votes?.dislike).toBe(0);
    expect(votes?.unknown).toBe(1);
  });

  it("handles the absence of votes correctly", async () => {
    const finolierId = "finolier1";
    const mockedVotes = [] as [];

    vi.mocked(prisma.votes.findMany).mockResolvedValue(mockedVotes);
    const votes = await fetchFinolierVotes(finolierId);

    expect(votes).toBeDefined();
    expect(votes?.like).toBe(0);
    expect(votes?.dislike).toBe(0);
    expect(votes?.unknown).toBe(0);
  });

  it("queries the database with the correct userId", async () => {
    const finolierId = "finolier1";
    await fetchFinolierVotes(finolierId);
    expect(prisma.votes.findMany).toHaveBeenCalledWith({
      where: {
        finolierId,
      },
    });
    expect(prisma.votes.findMany).toHaveBeenCalledTimes(1);
  });

  it("should return null when database throws an error", async () => {
    const finolierId = "finolier1";
    vi.mocked(prisma.votes.findMany).mockRejectedValue(
      new Error("Database error")
    );

    const votes = await fetchFinolierVotes(finolierId);

    expect(votes).toBeNull();
  });
});

describe("fetchUserVote", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it("fetches votes given a userId and finolierId", async () => {
    const finolierId = "finolier1";
    const userId = "userId1";
    const userVote = "like";

    const mockedVote = {
      userId,
      finolierId,
      vote: userVote,
      id: "1234",
      createdAt: new Date(),
    };
    vi.mocked(prisma.votes.findUnique).mockResolvedValue(mockedVote);

    const vote = await fetchUserVote(finolierId, userId);
    expect(vote).toBe(userVote);
  });

  it("returns undefined if no vote", async () => {
    const finolierId = "finolier1";
    const userId = "userId1";

    const mockedVote = null;
    vi.mocked(prisma.votes.findUnique).mockResolvedValue(mockedVote);

    const vote = await fetchUserVote(finolierId, userId);
    expect(vote).not.toBeDefined();
  });

  it("returns undefined when database throws an error", async () => {
    const finolierId = "finolier1";
    const userId = "userId1";

    vi.mocked(prisma.votes.findUnique).mockRejectedValue(
      new Error("Database error")
    );
    const vote = await fetchUserVote(finolierId, userId);

    expect(vote).not.toBeDefined();
  });

  it("queries the database with the correct userId and finolierId", async () => {
    const finolierId = "finolier1";
    const userId = "userId1";

    await fetchUserVote(finolierId, userId);
    expect(prisma.votes.findUnique).toHaveBeenCalledWith({
      where: {
        userId_finolierId: {
          userId,
          finolierId,
        },
      },
    });

    expect(prisma.votes.findUnique).toHaveBeenCalledTimes(1);
  });
});
