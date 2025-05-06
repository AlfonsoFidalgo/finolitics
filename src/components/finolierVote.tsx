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
  } | null>({
    like: 0,
    dislike: 0,
    unknown: 0,
  });

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
    fetchVotes();
  }, [finolierId]);

  useEffect(() => {
    async function fetchVote() {
      if (!finolierId || !userId) return;
      const userVote = await fetchUserVote(finolierId, userId);

      setVote(userVote);
    }
    fetchVote();
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
      <div className="flex gap-4 mt-4">
        <button
          className={`bg-green-500 text-white px-4 py-2 rounded shadow-md hover:bg-green-600 ${
            !userId ? "opacity-50 cursor-not-allowed" : ""
          } ${vote === "like" ? "underline font-bold" : ""}`}
          disabled={!userId}
          onClick={() => handleVote("like")}
        >
          Me cae bien
        </button>
        <button
          className={`bg-slate-500 text-white px-4 py-2 rounded shadow-md hover:bg-slate-600 ${
            !userId ? "opacity-50 cursor-not-allowed" : ""
          } ${vote === "unknown" ? "underline font-bold" : ""}`}
          disabled={!userId}
          onClick={() => handleVote("unknown")}
        >
          No sé quién es
        </button>
        <button
          className={`bg-red-500 text-white px-4 py-2 rounded shadow-md hover:bg-red-600 ${
            !userId ? "opacity-50 cursor-not-allowed" : ""
          } ${vote === "dislike" ? "underline font-bold" : ""}`}
          disabled={!userId}
          onClick={() => handleVote("dislike")}
        >
          Me cae mal
        </button>
      </div>
      {summaryVotes && <Chart votes={summaryVotes} />}
    </>
  );
}
