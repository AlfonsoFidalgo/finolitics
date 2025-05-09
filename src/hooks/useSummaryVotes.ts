import { type Dispatch, type SetStateAction, useEffect, useState } from "react";

import { fetchUserVote, fetchFinolierVotes } from "@/actions/utils";

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
  }, [finolierId, setSummaryVotes, setVote, userId, vote]);

  return summaryVotes;
}
