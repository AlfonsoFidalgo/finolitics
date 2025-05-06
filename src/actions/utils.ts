"use server";

import prisma from "@/db";

export async function emitVote(
  userId: string,
  finolierId: string,
  vote: "like" | "dislike" | "unknown",
  currentVote: "like" | "dislike" | "unknown" | undefined
): Promise<{ success: boolean; message: string }> {
  try {
    if (!currentVote) {
      const newVote = await prisma.votes.create({
        data: {
          userId,
          finolierId,
          vote,
        },
      });
      console.log("newVote", newVote);

      return {
        success: true,
        message: "Voto emitido correctamente",
      };
    } else {
      const updatedVote = await prisma.votes.update({
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
      console.log("updatedVote", updatedVote);

      return {
        success: true,
        message: "Voto actualizado correctamente",
      };
    }
  } catch (error: unknown) {
    return {
      success: false,
      message: `Error al emitir el voto: ${
        error instanceof Error ? error.message : "desconocido"
      }`,
    };
  }
}

export async function fetchUserVote(
  finolierId: string,
  userId: string
): Promise<"like" | "dislike" | "unknown" | undefined> {
  try {
    const vote = await prisma.votes.findUnique({
      where: {
        userId_finolierId: {
          userId,
          finolierId,
        },
      },
    });
    return vote?.vote;
  } catch (error: unknown) {
    console.error("Error fetching votes:", error);
    return undefined;
  }
}

export async function saveUser(userId: string): Promise<{
  success: boolean;
}> {
  try {
    await prisma.users.create({
      data: {
        id: userId,
      },
    });

    return {
      success: true,
    };
  } catch (error: unknown) {
    console.error("Error saving user:", error);
    return {
      success: false,
    };
  }
}
