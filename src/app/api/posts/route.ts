import { headers } from "next/headers";

import {
  fetchThreadDetails,
  fetchFinolierPosts,
  type Post,
  type Thread,
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
  let finolierPosts = [] as Post[];
  for (const finolier of finolierList) {
    const posts = await fetchFinolierPosts(finolier.id);
    if (posts.length === 0) {
      continue;
    }
    finolierPosts = [...finolierPosts, ...posts];
  }

  const uniqueThreads = new Set<string>();
  finolierPosts.forEach((post) => {
    uniqueThreads.add(post.threadId);
  });

  const threadDetails = [] as Thread[];
  for (const threadId of uniqueThreads) {
    const thread = await fetchThreadDetails(threadId);
    if (thread) {
      threadDetails.push(thread.thread);
    }
  }

  for (const thread of threadDetails) {
    try {
      const existingThread = await prisma.threads.findUnique({
        where: { id: thread.id },
      });
      if (!existingThread) {
        await prisma.threads.create({
          data: { ...thread },
        });
      }
    } catch (error) {
      console.error("Error saving thread:", error);
      return new Response(JSON.stringify({ error: "Error saving thread" }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
  }

  for (const post of finolierPosts) {
    try {
      const existingPost = await prisma.posts.findUnique({
        where: { id: post.id },
      });
      if (!existingPost) {
        await prisma.posts.create({
          data: { ...post },
        });
      } else {
        await prisma.posts.update({
          where: { id: post.id },
          data: { ...post },
        });
      }
    } catch (error) {
      console.error("Error saving post:", error);
      return new Response(JSON.stringify({ error: "Error saving post" }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
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
