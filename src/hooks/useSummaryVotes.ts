import { type Dispatch, type SetStateAction, useEffect, useState } from "react";

import { fetchUserVote, fetchFinolierVotes } from "@/actions/votes";

export default function useSummaryVotes(
  finolierId: string,
  userId: string | null,
  setVote: Dispatch<SetStateAction<"like" | "dislike" | "unknown" | undefined>>,
  vote: "like" | "dislike" | "unknown" | undefined
) {
  const [summaryVotes, setSummaryVotes] = useState<{
    like: number;
    dislike: number;
    unknown: number;
  } | null>(null);

  useEffect(() => {
    async function fetchVotes() {
      if (!finolierId) return;
      const summary = await fetchFinolierVotes(finolierId);
      setSummaryVotes(summary);
    }
    async function fetchVote() {
      if (!finolierId || !userId) return;
      const userVote = await fetchUserVote(finolierId, userId);

      setVote(userVote);
    }
    fetchVote();
    fetchVotes();
  }, [finolierId, setSummaryVotes, setVote, userId, vote]);

  return summaryVotes;
}
