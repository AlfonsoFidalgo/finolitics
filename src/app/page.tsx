"use client";

import { useState, useActionState } from "react";
import { fetchFinolierDetails, type Finolier } from "@/actions/disqus";

export default function Home() {
  const [finolier, setFinolier] = useState("");

  const [formState, action, isPending] = useActionState(
    fetchFinolierDetails.bind(null, finolier),
    { success: true, message: "", finolier: {} as Finolier }
  );

  console.log(formState);

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
          value={finolier}
          onChange={(e) => setFinolier(e.target.value)}
        />
        <button
          type="submit"
          disabled={!finolier}
          className="bg-blue-500 text-white rounded-lg p-4 mt-4 w-1/4 uppercase tracking-wider shadow-2xl hover:bg-blue-600"
        >
          {isPending ? "Cargando..." : "Buscar"}
        </button>
      </form>
    </div>
  );
}
