import FinolierList from "@/components/finolierList";
import { fetchFinoliers } from "@/actions/disqus";

export default async function FinolierListPage() {
  const finoliers = await fetchFinoliers();

  return (
    <div>
      <h1 className="text-3xl font-bold text-center mt-8">
        Directorio de Finoliers
      </h1>
      <FinolierList finoliers={finoliers} />
    </div>
  );
}
