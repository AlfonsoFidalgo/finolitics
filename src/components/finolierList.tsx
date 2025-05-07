import { type Finolier } from "@/actions/disqus";
import Link from "next/link";

export default function FinolierList({ finoliers }: { finoliers: Finolier[] }) {
  return (
    <div className="flex flex-col items-center justify-center mt-8">
      <ul className="list-disc">
        {finoliers.map((finolier) => (
          <li key={finolier.id} className="mb-2 list-none">
            <Link
              href={`/${finolier.id}`}
              className="text-blue-500 hover:underline"
            >
              {finolier.displayName}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
