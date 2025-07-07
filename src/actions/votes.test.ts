import { it, describe, expect, vi, beforeEach } from "vitest";
import { fetchFinolierVotes, fetchUserVote, emitVote } from "./votes";
import prisma from "@/db";
vi.mock("@/db", () => ({
  default: {
    votes: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
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

describe("emitVote", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const initialState = {
    success: false,
    message: "",
    vote: undefined,
  };

  it("returns the right object if form data is missing", async () => {
    const formData = new FormData();

    const result = await emitVote(initialState, formData);

    expect(result.message).toBe("Información incompleta");
  });

  it("Creates a new vote if no current vote", async () => {
    const userId = "user1";
    const finolierId = "finolier1";
    const vote = "like";

    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("finolierId", finolierId);
    formData.append("vote", vote);

    vi.mocked(prisma.votes.create).mockResolvedValue({
      userId,
      finolierId,
      vote,
      id: "123",
      createdAt: new Date(),
    });
    const result = await emitVote(initialState, formData);
    expect(result.message).toBe("Voto emitido correctamente");
    expect(result.success).toBe(true);
    expect(result.vote).toBe(vote);
    expect(prisma.votes.create).toHaveBeenCalledWith({
      data: {
        userId,
        finolierId,
        vote,
      },
    });
    expect(prisma.votes.create).toHaveBeenCalledTimes(1);
  });

  it("doesn't store or update the vote if it hasn't changed", async () => {
    const userId = "user1";
    const finolierId = "finolier1";
    const vote = "like";

    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("finolierId", finolierId);
    formData.append("vote", vote);
    formData.append("currentVote", vote);

    const result = await emitVote(initialState, formData);
    expect(result.message).toBe("Voto no cambiado");
    expect(prisma.votes.create).not.toHaveBeenCalled();
    expect(prisma.votes.update).not.toHaveBeenCalled();
  });

  it("Updates the vote correctly", async () => {
    const userId = "user1";
    const finolierId = "finolier1";
    const vote = "like";
    const currentVote = "dislike";

    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("finolierId", finolierId);
    formData.append("vote", vote);
    formData.append("currentVote", currentVote);

    vi.mocked(prisma.votes.update).mockResolvedValue({
      userId,
      finolierId,
      vote,
      id: "123",
      createdAt: new Date(),
    });
    const result = await emitVote(initialState, formData);

    expect(result.message).toBe("Voto actualizado correctamente");
    expect(result.success).toBe(true);
    expect(result.vote).toBe(vote);

    expect(prisma.votes.update).toHaveBeenCalledTimes(1);
    expect(prisma.votes.update).toHaveBeenCalledWith({
      where: {
        userId_finolierId: {
          userId,
          finolierId,
        },
      },
      data: {
        vote,
      },
    });
  });

  it("Returns error response if database error", async () => {
    const userId = "user1";
    const finolierId = "finolier1";
    const vote = "like";

    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("finolierId", finolierId);
    formData.append("vote", vote);

    vi.mocked(prisma.votes.create).mockRejectedValue(
      new Error("Database error")
    );
    const result = await emitVote(initialState, formData);

    expect(result.message).toBe("Error al emitir el voto");
    expect(result.success).toBe(false);
  });
});
