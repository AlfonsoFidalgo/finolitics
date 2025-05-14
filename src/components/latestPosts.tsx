import { type Post, type Thread } from "@/actions/disqus";
import Link from "next/link";

interface LatestPostsProps {
  latestPosts: Post[];
  threads: Thread[];
}

export default function LatestPosts({
  latestPosts,
  threads,
}: LatestPostsProps) {
  return (
    <div>
      <h1 className="text-3xl font-bold text-center mt-8">Grandes éxitos</h1>
      <div className="flex flex-col items-left gap-4 justify-center mt-2  p-4 sm:w-11/12 md:w-3/4 mx-auto rounded-xl shadow-lg">
        {latestPosts.map((post: Post) => (
          <div key={post.id} className="mb-4">
            <h2 className="text-md">
              <Link
                href={
                  threads.find((thread: Thread) => thread.id === post.threadId)!
                    .link
                }
              >
                {
                  threads.find((thread: Thread) => thread.id === post.threadId)
                    ?.title
                }
              </Link>
            </h2>
            <p className="text-md italic text-gray-500">{post.message}</p>
            <p className="text-sm italic text-gray-500">
              {new Date(post.createdAt).toLocaleDateString()} - {post.likes}{" "}
              likes
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
