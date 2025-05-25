import { type Thread, type Post } from "@/actions";
import PostComponent from "@/components/post";

interface LatestPostsProps {
  latestPosts: Post[];
  threads: Thread[];
  avatar: string;
}

export default function GreatestPosts({
  latestPosts,
  threads,
  avatar,
}: LatestPostsProps) {
  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold text-center mt-2">Grandes éxitos</h1>
      {latestPosts.length === 0 && (
        <p className="text-center py-4 text-lg text-zinc-600">
          Vuelve más tarde para ver los mejores comentarion de este especimen.
        </p>
      )}
      <div className="flex flex-col items-left gap-4 justify-center p-4 sm:w-11/12 md:w-3/4 mx-auto rounded-xl">
        {latestPosts.map((post: Post) => {
          const thread = threads.find((th: Thread) => th.id === post.threadId);
          return (
            <PostComponent
              key={post.id}
              post={post}
              thread={thread!}
              avatar={avatar}
            />
          );
        })}
      </div>
    </div>
  );
}
