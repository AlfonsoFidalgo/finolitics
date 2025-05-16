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
  createdAt: Date;
}

interface ResponseThread {
  id: string;
  clean_title: string;
  link: string;
  createdAt: string;
}

export async function fetchThread(
  id: string
): Promise<{ success: boolean; message: string; thread: Thread }> {
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
  const { response }: { response: ResponseThread } = await res.json();
  const threadData: Thread = {
    id: response.id,
    title: response.clean_title,
    link: response.link,
    createdAt: new Date(response.createdAt),
  };
  return { success: true, message: "Thread encontrado", thread: threadData };
}

/*
Fetches the latest threads from Disqus API
returns only the ones that are still not in the database
based on the createdAt date
*/
export async function fetchLatestThreads(
  limit: number = 100,
  forum: string = "finofilipino-org"
): Promise<{ success: boolean; message: string; threads: Thread[] }> {
  const url = `https://disqus.com/api/3.0/threads/list?api_key=${process.env.DISQUS_API}&forum=${forum}&limit=${limit}`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    return {
      success: false,
      message: "Error fetching threads",
      threads: [] as Thread[],
    };
  }
  const data: { response: ResponseThread[] } = await res.json();
  const threads = data.response;

  //Get most recent thread from database
  const mostRecentThread = await prisma.threads.findFirst({
    orderBy: { createdAt: "desc" },
  });
  const mostRecentTime = new Date(mostRecentThread?.createdAt || 0);

  const newerThreads = threads
    .filter((t) => new Date(t.createdAt!) > mostRecentTime)
    .map((t) => {
      return {
        id: t.id,
        title: t.clean_title,
        link: t.link,
        createdAt: new Date(t.createdAt),
      };
    });
  console.log(mostRecentTime);
  console.log("Newer threads: ", newerThreads);
  console.log(`fetched ${threads.length}, but storing ${newerThreads.length}`);
  return {
    success: true,
    message: "Threads fetched successfully",
    threads: newerThreads,
  };
}

export async function storeThreads(threads: Thread[]) {
  try {
    await prisma.threads.createMany({
      data: threads,
    });
    console.log(`Stored ${threads.length} threads`);
    return {
      success: true,
      message: "Threads stored successfully",
      threads: threads,
    };
  } catch (error) {
    console.error("Error storing threads:", error);
    return {
      success: false,
      message: "Error storing threads",
      threads: [] as Thread[],
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
