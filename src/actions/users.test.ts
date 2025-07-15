import { it, describe, expect, vi, beforeEach } from "vitest";
import { saveUser, isUserInDB } from "./users";
import prisma from "@/db";
vi.mock("@/db", () => ({
  default: {
    users: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

describe("saveUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  const userId = "user-123";
  it("stores a user given a userId", async () => {
    const response = await saveUser(userId);

    expect(prisma.users.create).toHaveBeenCalledWith({
      data: {
        id: userId,
      },
    });
    expect(response.success).toBe(true);
  });

  it("returns false if database error", async () => {
    vi.mocked(prisma.users.create).mockRejectedValue(
      new Error("Database error")
    );
    const response = await saveUser(userId);

    expect(response.success).toBe(false);
  });
});

describe("isUserInDB", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  const userId = "user-123";
  it("checks if a user exists given a userId", async () => {
    await isUserInDB(userId);

    expect(prisma.users.findUnique).toHaveBeenCalledWith({
      where: {
        id: userId,
      },
    });
  });

  it("returns false if user is not found", async () => {
    vi.mocked(prisma.users.findUnique).mockResolvedValue(null);
    const response = await isUserInDB(userId);

    expect(response).not.toBeTruthy();
  });

  it("returns true if user is found", async () => {
    vi.mocked(prisma.users.findUnique).mockResolvedValue({ id: "123" });
    const response = await isUserInDB(userId);

    expect(response).toBeTruthy();
  });

  it("returns false if database error", async () => {
    vi.mocked(prisma.users.findUnique).mockRejectedValue(
      new Error("Database error")
    );

    const response = await isUserInDB(userId);
    expect(response).not.toBeTruthy();
  });
});
