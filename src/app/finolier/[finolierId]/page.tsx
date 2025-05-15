import Image from "next/image";
import FinolierVote from "@/components/finolierVote";
import LatestPosts from "@/components/latestPosts";
import { fetchFinolierDetails } from "@/actions/disqus";
import { fetchLatestPosts, fetchThreads } from "@/actions/utils";

type Params = Promise<{ finolierId: string }>;

export default async function FinolierPage({ params }: { params: Params }) {
  const { finolierId } = await params;
  const finolierDetails = await fetchFinolierDetails(finolierId);
  const latestPosts = await fetchLatestPosts(finolierId);

  const threadIds = latestPosts.map((post) => post.threadId);
  const uniqueThreadIds = [...new Set(threadIds)];
  const threads = await fetchThreads(uniqueThreadIds);

  if (!finolierDetails.success) {
    return (
      <h1 className="text-3xl font-bold text-center mt-8">
        {finolierDetails.message}
      </h1>
    );
  }
  const { finolier } = finolierDetails;
  return (
    <div className="flex flex-col items-center justify-center mt-2  p-4 sm:w-11/12 md:w-3/4 mx-auto rounded-xl shadow-lg">
      <Image
        className="border-2 border-slate-700 rounded-full"
        src={finolier.avatar}
        width={100}
        height={100}
        alt="avatar"
      />
      <h1 className="text-4xl mb-1 font-bold text-center">
        {finolier.displayName}
      </h1>
      {finolier.about ||
        (finolier.location && (
          <h2 className="text-2xl mb-2 italic text-center">
            {finolier.about}. {finolier.location}
          </h2>
        ))}
      <h2 className="text-lg text-center">
        {new Intl.NumberFormat().format(finolier.numPosts)} comentarios,{" "}
        {new Intl.NumberFormat().format(finolier.numLikesReceived)} upvotes.
      </h2>
      <h2 className="text-lg text-center">
        {finolier.numFollowers} seguidores, siguiendo a {finolier.numFollowing}
      </h2>
      <h2 className="text-lg text-center">
        Reputación: {finolier.reputation.toFixed(2)}
      </h2>
      <FinolierVote finolierId={finolierId} />
      <LatestPosts latestPosts={latestPosts} threads={threads} />
    </div>
  );
}
