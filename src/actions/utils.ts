"use server";

import prisma from "@/db";

export async function emitVote(
  userId: string,
  finolierId: string,
  vote: "like" | "dislike" | "unknown"
): Promise<{ success: boolean; message: string }> {
  try {
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
  } catch (error: unknown) {
    return {
      success: false,
      message: `Error al emitir el voto: ${
        error instanceof Error ? error.message : "desconocido"
      }`,
    };
  }
}
