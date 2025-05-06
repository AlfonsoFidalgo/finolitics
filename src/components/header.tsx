"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useUserContext } from "@/contexts/userContext";
import { saveUser } from "@/actions/utils";

function generateUserId() {
  return `user_${Math.random().toString(36).substr(2, 9)}`;
}

export default function Header() {
  const { userId, setUserId } = useUserContext();

  useEffect(() => {
    if (userId) return;
    async function handleUserStorage() {
      if (typeof window !== "undefined" && window.localStorage) {
        let storedUserId = window.localStorage.getItem("userId");
        if (!storedUserId) {
          storedUserId = generateUserId();
          window.localStorage.setItem("userId", storedUserId);
          try {
            await saveUser(storedUserId);
          } catch (error) {
            console.error("Failed to save user:", error);
          }
        }
        setUserId(storedUserId);
      }
    }
    handleUserStorage();
  }, [setUserId, userId]);

  return (
    <header className="bg-slate-800 text-white p-4 flex items-center justify-between">
      <h1 className="text-3xl font-bold font-mono tracking-wider uppercase">
        <Link href="/" className="text-white hover:text-gray-300">
          Finolitics
        </Link>
      </h1>
      <div className="flex gap-8 mx-8">
        <Link
          href="/buscar"
          className="text-lg font-semibold hover:text-gray-300 transition duration-300"
        >
          Buscar
        </Link>
        <Link
          href="/listado"
          className="ml-4 text-lg font-semibold hover:text-gray-300 transition duration-300"
        >
          Listado
        </Link>
      </div>
    </header>
  );
}
