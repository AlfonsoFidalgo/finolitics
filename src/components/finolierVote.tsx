"use client";

import { useUserContext } from "@/contexts/userContext";
import { emitVote } from "@/actions/utils";

export default function FinolierVote({ finolierId }: { finolierId: string }) {
  const { userId } = useUserContext();
  console.log("userId", userId);

  async function handleVote(vote: "like" | "dislike" | "unknown") {
    if (!userId) {
      console.error("No userId found");
      return;
    }
    const result = await emitVote(userId, finolierId, vote);
    console.log(result);
  }

  return (
    <div className="flex gap-4 mt-4">
      <button
        className={`bg-green-500 text-white px-4 py-2 rounded shadow-md hover:bg-green-600 ${
          !userId ? "opacity-50 cursor-not-allowed" : ""
        }`}
        disabled={!userId}
        onClick={() => handleVote("like")}
      >
        Me cae bien
      </button>
      <button
        className={`bg-slate-500 text-white px-4 py-2 rounded shadow-md hover:bg-slate-600 ${
          !userId ? "opacity-50 cursor-not-allowed" : ""
        }`}
        disabled={!userId}
        onClick={() => handleVote("unknown")}
      >
        No sé quién es
      </button>
      <button
        className={`bg-red-500 text-white px-4 py-2 rounded shadow-md hover:bg-red-600 ${
          !userId ? "opacity-50 cursor-not-allowed" : ""
        }`}
        disabled={!userId}
        onClick={() => handleVote("dislike")}
      >
        Me cae mal
      </button>
    </div>
  );
}
