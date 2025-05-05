"use client";

import { useState, useEffect, useActionState } from "react";
import { fetchFinolierDetails, type Finolier } from "@/actions/disqus";

export default function Home() {
  const [finolierId, setFinolierId] = useState("");

  const [formState, action, isPending] = useActionState(
    fetchFinolierDetails.bind(null, finolierId),
    { success: null, message: "", finolier: {} as Finolier }
  );

  useEffect(() => {
    if (formState.success !== null) {
      setFinolierId("");
    }
  }, [formState]);

  return (
    <div>
      <h1 className="text-3xl font-bold pt-10 text-center">Finolitics</h1>
      <form
        className="flex flex-col items-center justify-center mt-8"
        action={action}
      >
        <label className="text-lg font-semibold mb-4">
          Busca a tu finolier favorito con su usuario de Disqus:
        </label>
        <input
          type="text"
          placeholder="Search for a finolier..."
          className="border border-gray-300 rounded-lg p-4 w-1/4"
          name="finolier"
          value={finolierId}
          onChange={(e) => setFinolierId(e.target.value)}
        />
        <button
          type="submit"
          disabled={!finolierId}
          className="bg-blue-500 text-white rounded-lg p-4 mt-2 w-1/4 uppercase tracking-wider shadow-2xl hover:bg-blue-600"
        >
          {isPending ? "Cargando..." : "Buscar"}
        </button>
      </form>
    </div>
  );
}
