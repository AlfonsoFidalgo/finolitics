import { type Finolier, type Post, type Thread } from "@/actions";
import PostComponent from "@/components/post";

interface LatestPostsProps {
  latestPosts: Post[];
  threads: Thread[];
  finoliers: Finolier[];
}

export default function GreatestRecentPosts({
  latestPosts,
  threads,
  finoliers,
}: LatestPostsProps) {
  return (
    <div className="w-full bg-zinc-50 rounded-lg shadow-md mb-14">
      <h1 className="text-3xl text-zinc-700 text-center mt-4">
        Últimos comentarios destacados
      </h1>
      <hr className="text-emerald-400 my-5 w-11/12 max-w-150 mx-auto" />
      <div className="flex flex-col items-left gap-2 justify-center p-4 sm:w-11/12 md:w-3/4 mx-auto rounded-xl">
        {latestPosts.map((post: Post) => {
          const finolier = finoliers.find((fn) => fn.id === post.finolierId);
          const thread = threads.find((th: Thread) => th.id === post.threadId);
          return (
            <PostComponent
              key={post.id}
              post={post}
              thread={thread!}
              avatar={finolier?.avatar || ""}
            />
          );
        })}
      </div>
    </div>
  );
}
