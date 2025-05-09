"use client";

import { useEffect, useState } from "react";
import { useUserContext } from "@/contexts/userContext";
import Chart from "@/components/UI/pieChart";
import { emitVote, fetchUserVote, fetchFinolierVotes } from "@/actions/utils";

export default function FinolierVote({ finolierId }: { finolierId: string }) {
  const { userId } = useUserContext();
  const [vote, setVote] = useState<"like" | "dislike" | "unknown" | undefined>(
    undefined
  );
  const [summaryVotes, setSummaryVotes] = useState<{
    like: number;
    dislike: number;
    unknown: number;
  } | null>(null);

  useEffect(() => {
    async function fetchVotes() {
      if (!finolierId) return;
      const summary = await fetchFinolierVotes(finolierId);
      if (!summary) {
        setSummaryVotes({
          like: 0,
          dislike: 0,
          unknown: 0,
        });
        return;
      }
      setSummaryVotes(summary);
    }
    async function fetchVote() {
      if (!finolierId || !userId) return;
      const userVote = await fetchUserVote(finolierId, userId);

      setVote(userVote);
    }
    fetchVote();
    fetchVotes();
  }, [finolierId, userId, vote]);

  async function handleVote(newVote: "like" | "dislike" | "unknown") {
    if (!userId) {
      console.error("No userId found");
      return;
    }
    const result = await emitVote(userId, finolierId, newVote, vote);
    if (result.success) {
      setVote(newVote);
    } else {
      console.error(result.message);
    }
  }

  return (
    <>
      <div className="flex flex-col items-center gap-0 mt-0 relative">
        <div className="relative">
          {summaryVotes && <Chart votes={summaryVotes} />}
        </div>
        <div className="flex gap-4 absolute bottom-5 mb-4 w-90">
          <button
            className={`bg-green-600 text-white w-1/3 text-sm h-14 rounded shadow-md hover:bg-green-700 ${
              !userId ? "opacity-50 cursor-not-allowed" : ""
            } ${vote === "like" ? "underline font-bold" : ""}`}
            disabled={!userId}
            onClick={() => handleVote("like")}
          >
            Me cae bien
          </button>
          <button
            className={`bg-gray-600 text-white w-1/3 text-sm h-14 rounded shadow-md hover:bg-gray-700 ${
              !userId ? "opacity-50 cursor-not-allowed" : ""
            } ${vote === "unknown" ? "underline font-bold" : ""}`}
            disabled={!userId}
            onClick={() => handleVote("unknown")}
          >
            No sé quién es
          </button>
          <button
            className={`bg-rose-600 text-white w-1/3 text-sm h-14 rounded shadow-md hover:bg-rose-700 ${
              !userId ? "opacity-50 cursor-not-allowed" : ""
            } ${vote === "dislike" ? "underline font-bold" : ""}`}
            disabled={!userId}
            onClick={() => handleVote("dislike")}
          >
            Me cae mal
          </button>
        </div>
      </div>
    </>
  );
}
