"use server";

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

export async function fetchFinoliers(): Promise<Finolier[]> {
  return await prisma.finoliers.findMany();
}

export async function fetchFinolierDetails(
  id: string
): Promise<FinolierFormState> {
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
  const data = await res.json();
  const finolierData = {
    id: sanitizedId,
    displayName: data.response.name,
    avatar: data.response.avatar?.permalink,
    about: data.response.about,
    location: data.response.location,
    numFollowers: data.response.numFollowers,
    numFollowing: data.response.numFollowing,
    numPosts: data.response.numPosts,
    reputation: data.response.reputation,
    numLikesReceived: data.response.numLikesReceived,
    isPrivate: data.response.isPrivate,
  };

  // check if finolier already exists in the database
  const existingFinolier = await prisma.finoliers.findUnique({
    where: { id: finolierData.id },
  });

  if (existingFinolier) {
    const updatedAt = new Date(existingFinolier.updatedAt);
    const hoursAgo24 = new Date(Date.now() - 1000 * 60 * 60 * 24);
    if (updatedAt < hoursAgo24) {
      console.log("Updating finolier data");
      await prisma.finoliers.update({
        where: { id: finolierData.id },
        data: { ...finolierData },
      });
    }
    return {
      success: true,
      message: "Finolier details updated successfully",
      finolier: finolierData,
    };
  }

  await prisma.finoliers.create({ data: { ...finolierData } });
  revalidatePath("/top-finoliers");
  return {
    success: true,
    message: "Finolier details fetched successfully",
    finolier: finolierData,
  };
}

export interface Thread {
  id: string;
  title: string;
  link: string;
}

export async function fetchThreadDetails(id: string) {
  const url = `https://disqus.com/api/3.0/threads/details?thread=${id}&api_key=${process.env.DISQUS_API}`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    return {
      success: false,
      message: "Thread no encontrado",
      thread: {} as Thread,
    };
  }
  const data = await res.json();
  const threadData = {
    id: data.response.id,
    title: data.response.clean_title,
    link: data.response.link,
  };

  try {
    const existingThread = await prisma.threads.findUnique({
      where: { id: threadData.id },
    });

    if (!existingThread) {
      await prisma.threads.create({
        data: { ...threadData },
      });
      return {
        success: true,
        message: "Thread details fetched successfully",
        thread: threadData,
      };
    }
  } catch (error) {
    console.error("Error fetching thread:", error);
    return {
      success: false,
      message: "Error storing the thread",
      thread: {} as Thread,
    };
  }
}

export interface Post {
  id: string;
  finolierId: string;
  createdAt: Date;
  threadId: string;
  message: string;
  likes: number;
  dislikes: number;
}

export async function fetchFinolierPosts(
  finolierId: string,
  limit: number = 50
): Promise<Post[]> {
  const url = `https://disqus.com/api/3.0/users/listPosts?user=username%3A${finolierId}&api_key=${process.env.DISQUS_API}&limit=${limit}`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    return [];
  }
  const data: {
    response: {
      id: string;
      createdAt: string;
      thread: string;
      raw_message: string;
      likes: number;
      dislikes: number;
      parent: number | null;
    }[];
  } = await res.json();

  const posts = data.response
    .filter((post) => !post.parent)
    .map((post) => {
      return {
        id: post.id,
        finolierId,
        createdAt: new Date(post.createdAt),
        threadId: post.thread,
        message: post.raw_message,
        likes: post.likes,
        dislikes: post.dislikes,
      };
    });

  return posts;
}
