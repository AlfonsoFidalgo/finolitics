import Image from "next/image";
import FinolierVote from "@/components/finolierVote";
import GreatestPosts from "@/components/greatestPosts";
import PrivateFinolier from "@/components/privateFinolier";
import { fetchFinolierDetails } from "@/actions/disqus";
import { fetchGreatestPosts, fetchThreads } from "@/actions/utils";

type Params = Promise<{ finolierId: string }>;

export default async function FinolierPage({ params }: { params: Params }) {
  const { finolierId } = await params;
  const finolierDetails = await fetchFinolierDetails(finolierId);
  const greatestPosts = await fetchGreatestPosts(finolierId);

  const threadIds = greatestPosts.map((post) => post.threadId);
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
    <div className="flex flex-col items-center justify-center mt-2  p-4 sm:w-11/12 md:w-3/4 mx-auto">
      <div className="w-full flex flex-col items-center">
        <Image
          className="border-2 border-stone-500 rounded-full"
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
            <h2 className="text-xl mb-4 italic text-center">
              {finolier.about}. {finolier.location}
            </h2>
          ))}
        <hr className="w-9/12 my-4 text-stone-400" />
        <h2>
          {new Intl.NumberFormat().format(finolier.numPosts)} comentarios,{" "}
          {new Intl.NumberFormat().format(finolier.numLikesReceived)} upvotes.
        </h2>
        <h2>
          {finolier.numFollowers} seguidores, siguiendo a{" "}
          {finolier.numFollowing}
        </h2>
        <h2>Reputación: {finolier.reputation.toFixed(2)}</h2>
        <FinolierVote finolierId={finolierId} />
      </div>
      {!finolier.isPrivate && (
        <GreatestPosts
          latestPosts={greatestPosts}
          threads={threads}
          avatar={finolier.avatar}
        />
      )}
      {finolier.isPrivate && <PrivateFinolier />}
    </div>
  );
}
