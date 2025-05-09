"use client";

import { useState, useEffect, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useUserContext } from "@/contexts/userContext";
import Chart from "@/components/UI/pieChart";
import { emitVote } from "@/actions/utils";
import useSummaryVotes from "@/hooks/useSummaryVotes";

export default function FinolierVote({ finolierId }: { finolierId: string }) {
  const { userId } = useUserContext();
  const [vote, setVote] = useState<"like" | "dislike" | "unknown" | undefined>(
    undefined
  );
  const [newVote, setNewVote] = useState<
    "like" | "dislike" | "unknown" | undefined
  >(undefined);
  const [formState, action] = useActionState(
    emitVote.bind(null, userId, finolierId, newVote, vote),
    {
      success: false,
      message: "",
      vote: undefined,
    }
  );

  const summaryVotes = useSummaryVotes(finolierId, userId, setVote, vote);

  useEffect(() => {
    if (formState.success) {
      setVote(formState.vote);
      setNewVote(undefined);
    }
  }, [formState]);

  return (
    <>
      <div className="flex flex-col items-center gap-0 mt-0 relative">
        <div className="relative">
          {summaryVotes && <Chart votes={summaryVotes} />}
        </div>
        <form
          action={action}
          className="flex gap-4 absolute bottom-5 mb-4 w-90"
        >
          <VoteButton
            label="Me cae bien"
            value="like"
            style={`bg-green-600 hover:bg-green-700 ${
              !userId ? "opacity-50 cursor-not-allowed" : ""
            } ${vote === "like" ? "underline font-bold" : ""}`}
            onVote={() => {
              setNewVote("like");
            }}
          />
          <VoteButton
            label="No sé quién es"
            value="unknown"
            style={`bg-gray-600 hover:bg-gray-700 ${
              !userId ? "opacity-50 cursor-not-allowed" : ""
            } ${vote === "unknown" ? "underline font-bold" : ""}`}
            onVote={() => {
              setNewVote("unknown");
            }}
          />
          <VoteButton
            label="Me cae mal"
            value="dislike"
            style={`bg-rose-600 hover:bg-rose-700 ${
              !userId ? "opacity-50 cursor-not-allowed" : ""
            } ${vote === "dislike" ? "underline font-bold" : ""}`}
            onVote={() => {
              setNewVote("dislike");
            }}
          />
        </form>
      </div>
    </>
  );
}

function VoteButton({
  label,
  value,
  style,
  onVote,
}: {
  label: string;
  value: string;
  style: string;
  onVote: () => void;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      name="vote"
      value={value}
      type="submit"
      disabled={pending}
      onClick={onVote}
      className={`text-white w-1/3 text-sm h-14 rounded shadow-md ${style} ${
        pending ? "cursor-not-allowed opacity-50" : ""
      }`}
    >
      {pending ? "..." : label}
    </button>
  );
}
