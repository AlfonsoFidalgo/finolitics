
import {  type Finolier } from "@/actions/disqus";

export default function FinolierList({ finoliers }: { finoliers: Finolier[] }) {
  return (
    <div className="flex flex-col items-center justify-center mt-8">
      <h2 className="text-2xl font-semibold mb-4">Finoliers</h2>
      <ul className="list-disc">
        {finoliers.map((finolier) => (
          <li key={finolier.id} className="mb-2 list-none">
            <a
              href={`https://disqus.com/${finolier.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              {finolier.displayName}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
