"use client";

import Link from "next/link";
import { useUserContext } from "@/contexts/userContext";
import useStoreUserId from "@/hooks/useStoreUserId";

export default function Header() {
  const { userId, setUserId } = useUserContext();
  console.log("userId", userId);

  useStoreUserId(setUserId);

  return (
    <header className="bg-slate-800 text-white sm:p-4 py-4 flex items-center justify-between w-full">
      <h1 className="text-xl sm:text-2xl font-bold font-mono tracking-wider uppercase">
        <Link href="/" className="text-white hover:text-gray-30 pl-2">
          Finolitics
        </Link>
      </h1>
      <div className="flex gap-8 mx-8">
        <Link
          href="/top-finoliers"
          className="sm:text-lg font-semibold hover:text-gray-300 transition duration-300"
        >
          Top Finoliers
        </Link>
      </div>
    </header>
  );
}
