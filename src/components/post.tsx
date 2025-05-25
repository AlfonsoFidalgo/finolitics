import Link from "next/link";
import Image from "next/image";
import { type Thread, type Post } from "@/actions";
import PostMessage from "@/components/postMessage";
import { DislikeIcon, LikeIcon } from "./UI/icons";

interface PostProps {
  post: Post;
  thread: Thread;
  avatar: string;
}

export default function PostComponent({ post, thread, avatar }: PostProps) {
  return (
    <div className="mb-4 flex flex-col gap-2 bg-zinc-100 p-4 rounded-lg shadow-md">
      <h2 className="text-md mb-2">
        <Link
          href={thread.link}
          className="text-blue-600 hover:underline"
          target="_blank"
        >
          {thread.title}
        </Link>
      </h2>
      <div className="flex items-start gap-2">
        <Link href={`/finolier/${post.finolierId}`}>
          <Image
            className="border-2 rounded-full"
            src={avatar || ""}
            width={40}
            height={40}
            alt="avatar"
          />
        </Link>
        <div className="flex flex-col gap-2 w-full">
          <PostMessage message={post.message} />
          <div className="text-sm italic text-gray-500 flex justify-between">
            {formatDate(post.createdAt)}
            <div className="flex gap-4">
              <div>
                {post.likes}{" "}
                <LikeIcon className="size-4 inline mb-2 fill-emerald-400" />{" "}
              </div>
              <div>
                {post.dislikes}{" "}
                <DislikeIcon className="size-4 inline mb-2 fill-rose-600" />{" "}
              </div>
            </div>
          </div>
        </div>
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
