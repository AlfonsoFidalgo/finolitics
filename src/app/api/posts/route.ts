import { headers } from "next/headers";

import {
  fetchAllThreads,
  fetchThreadDetails,
  fetchFinolierPosts,
  Thread,
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
  // Flatten the array and filter out empty results
  const finolierPosts = postsResults.flat().filter((post) => post);

  await fetchAllThreads(100);

  // Fetch all existing post IDs in one query
  const postIds = finolierPosts.map((post) => post.id);
  const existingPosts = await prisma.posts.findMany({
    where: { id: { in: postIds } },
    select: { id: true },
  });
  const existingIds = new Set(existingPosts.map((p) => p.id));

  const postsToCreate = finolierPosts.filter(
    (post) => !existingIds.has(post.id)
  );
  const uniqueThreadIds = Array.from(
    new Set(postsToCreate.map((post) => post.threadId))
  );
  const existingThreads = await prisma.threads.findMany({
    where: { id: { in: uniqueThreadIds } },
    select: { id: true },
  });
  const existingThreadIds = new Set(existingThreads.map((t) => t.id));
  const missingThreadIds = uniqueThreadIds.filter(
    (id) => !existingThreadIds.has(id)
  );

  const threadsToCreate = await Promise.all(
    missingThreadIds.map((threadId) => fetchThreadDetails(threadId))
  );

  if (threadsToCreate.length > 0) {
    const threadsData = threadsToCreate
      .map(
        (td) =>
          td?.thread && {
            id: td.thread.id,
            title: td.thread.title,
            createdAt: td.thread.createdAt,
            link: td.thread.link,
          }
      )
      .filter(Boolean);

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

  const postsToUpdate = finolierPosts.filter((post) =>
    existingIds.has(post.id)
  );

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
