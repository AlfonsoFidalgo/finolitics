import Link from "next/link";
import Image from "next/image";
import { type Thread } from "@/actions/threads";
import { type Post } from "@/actions/posts";
import { LikeIcon, DislikeIcon } from "@/components/UI/icons";
import PostMessage from "@/components/postMessage";

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
        {latestPosts.map((post: Post) => (
          <div
            key={post.id}
            className="mb-4 flex flex-col gap-2 bg-zinc-100 p-4 rounded-lg shadow-md"
          >
            <h2 className="text-md mb-2">
              <Link
                href={
                  threads.find((thread: Thread) => thread.id === post.threadId)!
                    .link
                }
                className="text-blue-600 hover:underline"
                target="_blank"
              >
                {
                  threads.find((thread: Thread) => thread.id === post.threadId)
                    ?.title
                }
              </Link>
            </h2>
            <div className="flex items-start gap-2">
              <Image
                className="border-2 rounded-full"
                src={avatar}
                width={40}
                height={40}
                alt="avatar"
              />
              <div className="flex flex-col gap-2 w-full">
                <PostMessage message={post.message} />
                <div className="text-sm italic text-gray-500 flex justify-between">
                  {formatDate(post.createdAt)}
                  <div className="flex gap-4">
                    <div>
                      {post.likes}{" "}
                      <LikeIcon className="size-4 inline mb-2 fill-gray-500" />{" "}
                    </div>
                    <div>
                      {post.dislikes}{" "}
                      <DislikeIcon className="size-4 inline mb-2 fill-gray-500" />{" "}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatDate(dateString: Date): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
