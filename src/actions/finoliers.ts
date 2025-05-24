"use server";

import { subDays } from "date-fns";
import prisma from "@/db";
import { revalidatePath } from "next/cache";

if (!process.env.DISQUS_API) {
  throw new Error("DISQUS_API_KEY is not defined");
}

export interface Finolier {
  id: string;
  displayName: string;
  avatar: string;
  about: string;
  location: string;
  numFollowers: number;
  numFollowing: number;
  numPosts: number;
  reputation: number;
  numLikesReceived: number;
  isPrivate: boolean;
}

interface FinolierFormState {
  success: boolean | null;
  message: string;
  finolier: Finolier;
}

async function fetchFinolier(id: string) {
  const sanitizedId = id[0] === "@" ? id.slice(1) : id;
  const url = `https://disqus.com/api/3.0/users/details?user=username%3A${sanitizedId}&api_key=${process.env.DISQUS_API}`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    return {
      success: false,
      message: "Finolier no encontrado",
      finolier: {} as Finolier,
    };
  }
  const { response } = await res.json();
  const finolierData = {
    id: sanitizedId,
    displayName: response.name,
    avatar: response.avatar?.permalink,
    about: response.about,
    location: response.location,
    numFollowers: response.numFollowers,
    numFollowing: response.numFollowing,
    numPosts: response.numPosts,
    reputation: response.reputation,
    numLikesReceived: response.numLikesReceived,
    isPrivate: response.isPrivate,
  };
  return { success: true, message: "Finolier fetched", finolier: finolierData };
}

export async function addOrUpdateFinolier(
  id: string
): Promise<FinolierFormState> {
  const finolierData = await fetchFinolier(id);
  if (!finolierData.success) {
    return {
      success: false,
      message: finolierData.message,
      finolier: {} as Finolier,
    };
  }
  const { finolier } = finolierData;
  // check if finolier already exists in the database
  const existingFinolier = await prisma.finoliers.findUnique({
    where: { id: finolier.id },
  });

  if (existingFinolier) {
    const updatedAt = new Date(existingFinolier.updatedAt);
    const hoursAgo24 = new Date(Date.now() - 1000 * 60 * 60 * 24);
    if (updatedAt < hoursAgo24) {
      console.log("Updating finolier data");
      await prisma.finoliers.update({
        where: { id: finolier.id },
        data: { ...finolier },
      });
    }
    return {
      success: true,
      message: "Finolier details updated successfully",
      finolier,
    };
  }

  await prisma.finoliers.create({ data: { ...finolier } });
  revalidatePath("/top-finoliers");
  return {
    success: true,
    message: "Finolier details fetched successfully",
    finolier,
  };
}

export async function fetchTopReputationFinoliers(): Promise<Finolier[]> {
  try {
    const finoliers = await prisma.finoliers.findMany({
      orderBy: {
        reputation: "desc",
      },
      cacheStrategy: { ttl: 3600 },
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
      cacheStrategy: { ttl: 3600 },
      take: 5,
    });

    return finoliers;
  } catch (error: unknown) {
    console.error("Error fetching top comentators finoliers:", error);
    return [];
  }
}

export async function fetchMostActiveLast7Days(): Promise<
  (Finolier & { count: number; likes: number })[]
> {
  const sevenDaysAgo = subDays(new Date(), 7);

  const mostActive = await prisma.posts.groupBy({
    by: ["finolierId"],
    where: {
      createdAt: {
        gte: sevenDaysAgo,
      },
    },
    cacheStrategy: { ttl: 3600 },
    _count: {
      _all: true,
    },
    _sum: {
      likes: true,
      // dislikes: true,
    },
    orderBy: {
      _count: {
        id: "desc",
      },
    },
    take: 10,
  });

  const finoliers = await prisma.finoliers.findMany({
    where: { id: { in: mostActive.map((item) => item.finolierId) } },
    cacheStrategy: { ttl: 3600 },
  });

  return mostActive
    .map((item) => {
      const finolier = finoliers.find((f) => f.id === item.finolierId);
      return finolier
        ? {
            ...finolier,
            count: item._count._all,
            likes: item._sum.likes ?? 0,
            // dislikes: item._sum.dislikes ?? 0,
          }
        : null;
    })
    .filter(Boolean) as (Finolier & {
    count: number;
    likes: number;
    // dislikes: number;
  })[];
}

export async function fetchTopUpvoted(): Promise<Finolier[]> {
  try {
    const finoliers = await prisma.finoliers.findMany({
      orderBy: {
        numLikesReceived: "desc",
      },
      cacheStrategy: { ttl: 3600 },
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
      cacheStrategy: { ttl: 3600 },
      orderBy: {
        reputation: "desc",
      },
      take: 50,
    });

    return finoliers;
  } catch (error: unknown) {
    console.error("Error fetching non-private finoliers:", error);
    return [];
  }
}

export async function fetchFinoliers(
  finolierIds: string[]
): Promise<Finolier[]> {
  try {
    const finoliers = await prisma.finoliers.findMany({
      where: {
        id: {
          in: finolierIds,
        },
      },
    });

    return finoliers;
  } catch (error: unknown) {
    console.error("Error fetching finoliers:", error);
    return [];
  }
}
