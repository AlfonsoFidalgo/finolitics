import Image from "next/image";
import { fetchFinolierDetails } from "@/actions/disqus";

export default async function FinolierPage({
  params,
}: {
  params: {
    finolierId: string;
  };
}) {
  const { finolierId } = await params;
  const finolierDetails = await fetchFinolierDetails(finolierId);
  if (!finolierDetails.success) {
    return (
      <h1 className="text-3xl font-bold text-center mt-8">
        {finolierDetails.message}
      </h1>
    );
  }
  const { finolier } = finolierDetails;
  return (
    <div className="flex flex-col items-center justify-center mt-8">
      <Image
        className="border-2 border-slate-700 rounded-full"
        src={finolier.avatar}
        width={100}
        height={100}
        alt="avatar"
      />
      <h1 className="text-4xl mb-4 font-bold">{finolier.displayName}</h1>
      {finolier.about && finolier.location && (
        <h2 className="text-2xl mb-4 italic">
          {finolier.about}. {finolier.location}
        </h2>
      )}
      <h2 className="text-xl mb-2">{finolier.numPosts} comentarios</h2>
      <h2 className="text-xl mb-2">
        {finolier.numFollowers} seguidores, siguiendo a {finolier.numFollowing}
      </h2>
    </div>
  );
}
