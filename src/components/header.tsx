"use client";

import Link from "next/link";
import { useUserContext } from "@/contexts/userContext";
import useStoreUserId from "@/hooks/useStoreUserId";

export default function Header() {
  const { userId, setUserId } = useUserContext();

  useStoreUserId(userId, setUserId);

  return (
    <header className="bg-emerald-300 text-zinc-900 sm:p-4 py-4 flex items-center justify-between w-full h-24">
      <h1 className="text-xl sm:text-3xl font-bold font-mono tracking-wider uppercase">
        <Link href="/" className="hover:text-zinc-700 pl-2">
          Finolitics
        </Link>
      </h1>
      <div className="flex gap-8 mx-8">
        <Link
          href="/buscar"
          className="sm:text-lg font-semibold hover:text-zinc-700 transition duration-300"
        >
          Buscar
        </Link>
        <Link
          href="/top-finoliers"
          className="sm:text-lg font-semibold hover:text-zinc-700 transition duration-300"
        >
          Top Finoliers
        </Link>
      </div>
    </header>
  );
}
