"use client";

import { useState, useEffect, useActionState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { fetchFinolierDetails, type Finolier } from "@/actions/finoliers";

export default function FinolierForm() {
  const router = useRouter();
  const [finolierId, setFinolierId] = useState("");

  const [formState, action, isPending] = useActionState(
    fetchFinolierDetails.bind(null, finolierId),
    { success: null, message: "", finolier: {} as Finolier }
  );

  useEffect(() => {
    if (formState.success) {
      const { finolier } = formState;
      router.push(`/finolier/${finolier.id}`);
    }
    if (formState.success !== null) {
      setFinolierId("");
    }
  }, [formState, router]);

  return (
    <div className="text-center w-11/12 md:w-6/12 mx-auto p-4 bg-zinc-50 rounded-lg shadow-md">
      <h1 className="text-3xl text-zinc-700">
        Busca a un finolier con su usuario de Disqus
      </h1>
      <hr className="text-emerald-400 my-5 w-11/12 max-w-150 mx-auto" />
      <form
        className="flex flex-col items-center justify-start  gap-2 mb-8"
        action={action}
      >
        <Image
          src="/disqusId.png"
          alt="Disqus ID"
          width={350}
          height={350}
          className="mx-auto mb-4"
        />
        <input
          type="text"
          placeholder="Buscar finolier..."
          className="border text-center text-lg font-mono tracking-wider border-zinc-300 rounded-lg p-4 sm:w-96 w-full focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 focus:outline-none transition duration-300"
          name="finolier"
          value={finolierId}
          onChange={(e) => setFinolierId(e.target.value)}
        />
        <button
          type="submit"
          disabled={!finolierId}
          className="bg-emerald-400 text-zinc-900 font-bold rounded-lg p-4 mt-2 sm:w-96 w-full uppercase tracking-wider shadow-2xl hover:bg-emerald-600 cursor-pointer transition duration-300 disabled:opacity-50 disabled:cursor-default"
        >
          {isPending ? "Cargando..." : "Hazte con todos"}
        </button>
      </form>
      {formState.success === false && (
        <>
          <hr className="text-emerald-400 my-5 w-11/12 max-w-150 mx-auto" />
          <div className="mx-auto mt-4 w-1/2">
            <p className="text-red-500 text-md font-semibold mt-2 text-center">
              Finolier no encontrado. Asegúrate de usar el id de Disqus, no el
              nombre de usuario.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
