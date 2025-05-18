"use server";

import prisma from "@/db";
import { Post } from "@/actions";

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

export async function storeThreads(threads: Thread[]): Promise<{
  success: boolean;
}> {
  try {
    await prisma.threads.createMany({
      data: threads as Thread[],
    });
    return {
      success: true,
    };
  } catch (error) {
    console.error("Error storing threads:", error);
    return {
      success: false,
    };
  }
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

export async function fetchThreadsDB(ids: string[]): Promise<Thread[]> {
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
  console.log(`fetched ${threads.length}, but storing ${newerThreads.length}`);
  return {
    success: true,
    message: "Threads fetched successfully",
    threads: newerThreads,
  };
}

export async function getMissingThreadIds(posts: Post[]): Promise<string[]> {
  //Among a list of posts, get the threads of those posts
  //that are not in the db
  const uniqueThreadIds = Array.from(
    new Set(posts.map((post) => post.threadId))
  );
  const existingThreads = await prisma.threads.findMany({
    where: { id: { in: uniqueThreadIds } },
    select: { id: true },
  });
  const existingThreadIds = new Set(existingThreads.map((t) => t.id));
  const missingThreadIds = uniqueThreadIds.filter(
    (id) => !existingThreadIds.has(id)
  );
  console.log("Missing threads:", missingThreadIds.length);
  return missingThreadIds;
}
