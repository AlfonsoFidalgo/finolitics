import { headers } from "next/headers";

import { fetchAllThreads, fetchFinolierPosts } from "@/actions/disqus";
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

  // Fetch all posts for all finoliers in parallel for efficiency
  const postsResults = await Promise.all(
    finolierList.map((finolier) => fetchFinolierPosts(finolier.id))
  );
  // Flatten the array and filter out empty results
  const finolierPosts = postsResults.flat().filter((post) => post);

  await fetchAllThreads(50);

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
