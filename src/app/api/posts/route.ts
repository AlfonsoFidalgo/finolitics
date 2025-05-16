import { headers } from "next/headers";

import {
  fetchLatestThreads,
  fetchThread,
  fetchFinolierPosts,
  storeThreads,
  type Thread,
  Post,
} from "@/actions/disqus";
import { fetchNonPrivateFinoliers } from "@/actions/utils";
import prisma from "@/db";

export async function GET() {
  const headersList = await headers();
  if (
    headersList.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  const finolierList = await fetchNonPrivateFinoliers();
  if (finolierList.length === 0) {
    return new Response(JSON.stringify({ error: "No finoliers found" }), {
      status: 404,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  // Fetch all posts for all finoliers in parallel
  const postsResults = await Promise.all(
    finolierList.map((finolier) => fetchFinolierPosts(finolier.id))
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
    console.log("Threads to create:", threadsData);
    try {
      await prisma.threads.createMany({
        data: threadsData as Thread[],
      });
    } catch (error) {
      console.error("Error storing threads:", error);
      return new Response(JSON.stringify({ error: "Error storing threads" }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
  }

  try {
    await prisma.$transaction([
      ...postsToCreate.map((post) =>
        prisma.posts.create({ data: { ...post } })
      ),
      ...postsToUpdate.map((post) =>
        prisma.posts.update({ where: { id: post.id }, data: { ...post } })
      ),
    ]);
  } catch (error) {
    console.error("Error saving posts:", error);
    return new Response(JSON.stringify({ error: "Error saving posts" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  return new Response(
    JSON.stringify({
      message: "Finolier posts and threads updated successfully",
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}

async function getPostsToCreate(posts: Post[]) {
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

async function getMissingThreadIds(posts: Post[]): Promise<string[]> {
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
