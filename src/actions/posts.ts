"use server";

import prisma from "@/db";
import {
  fetchLatestThreads,
  fetchThread,
  getMissingThreadIds,
  storeThreads,
  Thread,
} from "@/actions";

export interface Post {
  id: string;
  finolierId: string;
  createdAt: Date;
  threadId: string;
  message: string;
  likes: number;
  dislikes: number;
}

export async function storeAndUpdatePosts(
  postsToCreate: Post[],
  postsToUpdate: Post[]
): Promise<{
  success: boolean;
}> {
  try {
    await prisma.$transaction([
      ...postsToCreate.map((post) =>
        prisma.posts.create({ data: { ...post } })
      ),
      ...postsToUpdate.map((post) =>
        prisma.posts.update({ where: { id: post.id }, data: { ...post } })
      ),
    ]);
    return {
      success: true,
    };
  } catch (error) {
    console.error("Error storing or updating posts:", error);
    return {
      success: false,
    };
  }
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

export async function getPostsToCreate(posts: Post[]) {
  //From a given list of posts fetched from the API,
  //return the list of posts that are not in the db
  const postIds = posts.map((post) => post.id);
  const existingPosts = await prisma.posts.findMany({
    where: { id: { in: postIds } },
    select: { id: true },
  });
  const existingIds = new Set(existingPosts.map((p) => p.id));

  const postsToCreate = posts.filter((post) => !existingIds.has(post.id));

  const postsToUpdate = posts.filter((post) => existingIds.has(post.id));
  console.log("Total posts:", posts.length);
  console.log("Posts to create:", postsToCreate.length);
  console.log("Posts to update:", postsToUpdate.length);
  return { postsToCreate, postsToUpdate };
}

export async function fetchGreatestPostsDB(
  finolierId: string
): Promise<Post[]> {
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

export async function fetchRecentGreatestPostsDB(): Promise<Post[]> {
  try {
    const posts = await prisma.posts.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
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

export async function updateFinoliersPosts(finolierIds: string[]) {
  // Fetch all posts for all finoliers in parallel
  const postsResults = await Promise.all(
    finolierIds.map((id) => fetchFinolierPosts(id))
  );
  const finolierPosts = postsResults.flat().filter((post) => post);
  //fetch and store the latest threads
  const response = await fetchLatestThreads(100);
  if (response.success && response.threads.length > 0) {
    await storeThreads(response.threads);
  }

  const { postsToCreate, postsToUpdate } = await getPostsToCreate(
    finolierPosts
  );
  const missingThreadIds = await getMissingThreadIds(postsToCreate);
  const threadsToCreate = await Promise.all(
    missingThreadIds.map((threadId) => fetchThread(threadId))
  );

  if (threadsToCreate.length > 0) {
    const threadsData = threadsToCreate
      .map(
        (td) =>
          td?.thread && {
            id: td.thread.id,
            title: td.thread.title,
            createdAt: new Date(td.thread.createdAt),
            link: td.thread.link,
          }
      )
      .filter(Boolean);
    const { success } = await storeThreads(threadsData as Thread[]);
    if (!success) {
      return {
        success: false,
        message: "Error storing threads",
      };
    }
  }

  const { success } = await storeAndUpdatePosts(postsToCreate, postsToUpdate);
  if (!success) {
    return {
      success: false,
      message: "Error storing posts",
    };
  }
  return {
    success: true,
    message: "Posts updated successfully",
  };
}
