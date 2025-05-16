import { type Finolier } from "@/actions/disqus";
import Image from "next/image";
import Link from "next/link";

export default function Table({
  data,
  columns,
}: {
  data: Finolier[];
  columns: string[];
}) {
  //   console.log(data);
  return (
    <div className="relative overflow-x-auto">
      <table className="w-full text-left rtl:text-right">
        <thead className="uppercase text-xs sm:text-sm md:text-md bg-lime-600 text-stone-50">
          <tr>
            {columns.map((col) => {
              return (
                <th key={col} scope="col" className="px-2 py-3 text-center">
                  {col}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="text-xs sm:text-sm md:text-lg">
          {data.map((finolier: Finolier) => {
            return (
              <tr
                key={finolier.id}
                className="border-b bg-stone-50 border-stone-300 hover:bg-stone-100 cursor-pointer"
              >
                <th
                  scope="row"
                  className="font-medium italics text-stone-600 text-xs sm:text-sm whitespace-nowrap py-3 px-0"
                >
                  <Link href={`/finolier/${finolier.id}`}>
                    <div className="flex flex-col items-center gap-1">
                      <Image
                        className="rounded-full"
                        src={finolier.avatar}
                        alt="avatar"
                        width={50}
                        height={50}
                      />
                      <p>{finolier.displayName}</p>
                    </div>
                  </Link>
                </th>
                <td className="text-center whitespace-nowrap py-3 px-0 ">
                  <Link href={`/finolier/${finolier.id}`}>
                    {finolier.reputation.toFixed(2)}
                  </Link>
                </td>
                <td className="text-center whitespace-nowrap py-3 px-0 ">
                  <Link href={`/finolier/${finolier.id}`}>
                    {new Intl.NumberFormat().format(finolier.numPosts)}
                  </Link>
                </td>
                <td className="text-center whitespace-nowrap py-3 px-0 ">
                  <Link href={`/finolier/${finolier.id}`}>
                    {(finolier.numLikesReceived / finolier.numPosts).toFixed(2)}
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
