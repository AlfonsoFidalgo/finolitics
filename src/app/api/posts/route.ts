import { headers } from "next/headers";

import {
  storeAndUpdatePosts,
  fetchFinolierPosts,
  getPostsToCreate,
} from "@/actions/posts";
import {
  type Thread,
  storeThreads,
  fetchThread,
  fetchLatestThreads,
  getMissingThreadIds,
} from "@/actions/threads";
import { fetchNonPrivateFinoliers } from "@/actions/finoliers";

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
    const { success } = await storeThreads(threadsData as Thread[]);
    if (!success) {
      return new Response(JSON.stringify({ error: "Error storing threads" }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
  }

  const { success } = await storeAndUpdatePosts(postsToCreate, postsToUpdate);
  if (!success) {
    return new Response(
      JSON.stringify({ error: "Error saving and updating posts" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
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
