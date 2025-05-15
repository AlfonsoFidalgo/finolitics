"use server";

import prisma from "@/db";

import { Post, Thread, type Finolier } from "@/actions/disqus";

interface EmitVoteFormState {
  success: boolean;
  message: string;
  vote: "like" | "dislike" | "unknown" | undefined;
}

type Vote = "like" | "dislike" | "unknown" | undefined;

export async function emitVote(
  currState: EmitVoteFormState,
  formData: FormData
): Promise<EmitVoteFormState> {
  const userId = formData.get("userId") as string | null;
  const finolierId = formData.get("finolierId") as string;
  const vote = formData.get("vote") as Vote;
  const currentVote = formData.get("currentVote") as Vote;

  if (!userId || !finolierId || !vote) {
    return {
      success: false,
      message: "Información incompleta",
      vote: currentVote,
    };
  }

  try {
    if (!currentVote) {
      const newVote = await prisma.votes.create({
        data: {
          userId,
          finolierId,
          vote,
        },
      });

      return {
        success: true,
        message: "Voto emitido correctamente",
        vote: newVote.vote,
      };
    } else if (vote === currentVote) {
      return {
        success: true,
        message: "Voto no cambiado",
        vote: currentVote,
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

      return {
        success: true,
        message: "Voto actualizado correctamente",
        vote: updatedVote.vote,
      };
    }
  } catch (error: unknown) {
    console.error("Error al emitir el voto:", error);
    return {
      success: false,
      message: "Error al emitir el voto",
      vote: currentVote,
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

export async function fetchFinolierVotes(finolierId: string): Promise<{
  like: number;
  dislike: number;
  unknown: number;
} | null> {
  try {
    const votes = await prisma.votes.findMany({
      where: {
        finolierId,
      },
    });
    const summaryVotes = {
      like: 0,
      dislike: 0,
      unknown: 0,
    };
    votes.forEach((vote) => {
      if (vote.vote === "like") {
        summaryVotes.like++;
      } else if (vote.vote === "dislike") {
        summaryVotes.dislike++;
      } else if (vote.vote === "unknown") {
        summaryVotes.unknown++;
      }
    });
    return summaryVotes;
  } catch (error: unknown) {
    console.error("Error fetching votes:", error);
    return null;
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

export async function isUserInDB(userId: string): Promise<boolean> {
  try {
    const user = await prisma.users.findUnique({
      where: {
        id: userId,
      },
    });
    if (user) {
      return true;
    }
    return false;
  } catch (error: unknown) {
    console.error("Error fetching user:", error);
    return false;
  }
}

export async function fetchTopReputationFinoliers(): Promise<Finolier[]> {
  try {
    const finoliers = await prisma.finoliers.findMany({
      orderBy: {
        reputation: "desc",
      },
      take: 5,
    });

    return finoliers;
  } catch (error: unknown) {
    console.error("Error fetching top reputation finoliers:", error);
    return [];
  }
}

export async function fetchTopComentators(): Promise<Finolier[]> {
  try {
    const finoliers = await prisma.finoliers.findMany({
      orderBy: {
        numPosts: "desc",
      },
      take: 5,
    });

    return finoliers;
  } catch (error: unknown) {
    console.error("Error fetching top comentators finoliers:", error);
    return [];
  }
}

export async function fetchTopUpvoted(): Promise<Finolier[]> {
  try {
    const finoliers = await prisma.finoliers.findMany({
      orderBy: {
        numLikesReceived: "desc",
      },
      take: 10,
    });

    return finoliers;
  } catch (error: unknown) {
    console.error("Error fetching top upvoteds finoliers:", error);
    return [];
  }
}

export async function fetchNonPrivateFinoliers(): Promise<Finolier[]> {
  try {
    const finoliers = await prisma.finoliers.findMany({
      where: {
        isPrivate: false,
      },
      orderBy: {
        reputation: "desc",
      },
      take: 10,
    });

    return finoliers;
  } catch (error: unknown) {
    console.error("Error fetching non-private finoliers:", error);
    return [];
  }
}

export async function fetchGreatestPosts(finolierId: string): Promise<Post[]> {
  try {
    const posts = await prisma.posts.findMany({
      where: {
        finolierId,
      },
      orderBy: {
        likes: "desc",
      },
      take: 10,
    });

    return posts;
  } catch (error: unknown) {
    console.error("Error fetching latest posts:", error);
    return [];
  }
}

export async function fetchThreads(ids: string[]): Promise<Thread[]> {
  try {
    const threads = await prisma.threads.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    return threads;
  } catch (error: unknown) {
    console.error("Error fetching threads:", error);
    return [];
  }
}
