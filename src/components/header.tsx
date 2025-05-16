"use client";

import Link from "next/link";
import { useUserContext } from "@/contexts/userContext";
import useStoreUserId from "@/hooks/useStoreUserId";

export default function Header() {
  const { userId, setUserId } = useUserContext();

  useStoreUserId(userId, setUserId);

  return (
    <header className="bg-lime-800 text-stone-50 sm:p-4 py-4 flex items-center justify-between w-full">
      <h1 className="text-xl sm:text-2xl font-bold font-mono tracking-wider uppercase">
        <Link href="/" className="hover:text-stone-300 pl-2">
          Finolitics
        </Link>
      </h1>
      <div className="flex gap-8 mx-8">
        <Link
          href="/top-finoliers"
          className="sm:text-lg font-semibold hover:text-stone-300 transition duration-300"
        >
          Top Finoliers
        </Link>
      </div>
    </header>
  );
}
