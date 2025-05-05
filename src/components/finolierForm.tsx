"use client";

import { useState, useEffect, useActionState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { fetchFinolierDetails, type Finolier } from "@/actions/disqus";

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
      router.push(`/${finolier.id}`);
    }
    if (formState.success !== null) {
      setFinolierId("");
    }
  }, [formState, router]);

  return (
    <div>
      <form
        className="flex flex-col items-center justify-center mt-8"
        action={action}
      >
        <label className="text-lg font-semibold mb-2">
          Busca a tu finolier favorito con su usuario de Disqus:
        </label>
        <Image
          src="/disqusId.png"
          alt="Disqus ID"
          width={300}
          height={300}
          className="mx-auto mb-4"
        />
        <input
          type="text"
          placeholder="Buscar finolier..."
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
      {formState.success === false && (
        <div className="mx-auto mt-4 w-1/2">
          <p className="text-red-500 text-md font-semibold mt-2 text-center">
            Finolier no encontrado. Asegúrate de usar el id de Disqus, no el
            nombre de usuario.
          </p>
        </div>
      )}
    </div>
  );
}
