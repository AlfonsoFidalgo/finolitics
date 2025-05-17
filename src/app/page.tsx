export const revalidate = 3600;

import { fetchFinoliers } from "@/actions/finoliers";
import { fetchThreadsDB } from "@/actions/threads";
import { fetchRecentGreatestPostsDB } from "@/actions/posts";

import GreatestRecentPosts from "@/components/greatestRecentPosts";

export default async function FinolierSearch() {
  const recentPosts = await fetchRecentGreatestPostsDB();
  const threadIds = recentPosts.map((post) => post.threadId);
  const uniqueThreadIds = [...new Set(threadIds)];
  const threads = await fetchThreadsDB(uniqueThreadIds);
  const finolierIds = recentPosts.map((post) => post.finolierId);
  const uniqueFinolierIds = [...new Set(finolierIds)];
  const finoliers = await fetchFinoliers(uniqueFinolierIds);

  return (
    <div className="flex flex-col items-center justify-center mt-6 sm:mt-14">
      <h1 className="text-2xl w-11/12 sm:w-8/12 text-center">
        Tu sitio de confianza para saber más sobre tus finoliers favoritos,
        darles cariño y poder perder aún más el tiempo.
      </h1>
      <div className="flex flex-col items-center justify-center mt-4 w-11/12 sm:w-8/12">
        <GreatestRecentPosts
          latestPosts={recentPosts}
          threads={threads}
          finoliers={finoliers}
        />
      </div>
    </div>
  );
}
