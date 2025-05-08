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
      <table className="w-full text-sm text-left rtl:text-right text-gray-400">
        <thead className="text-md  uppercase bg-gray-700 text-white">
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
        <tbody>
          {data.map((finolier: Finolier) => {
            return (
              <tr
                key={finolier.id}
                className="border-b bg-gray-800 border-gray-700 hover:bg-gray-600 cursor-pointer"
              >
                <th
                  scope="row"
                  className="px-2 py-4 font-medium whitespace-nowrap text-white"
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
                <td className="px-2 py-4 text-center whitespace-nowrap text-white">
                  <Link href={`/finolier/${finolier.id}`}>
                    {finolier.reputation.toFixed(2)}
                  </Link>
                </td>
                <td className="px-2 py-4 text-center whitespace-nowrap text-white">
                  <Link href={`/finolier/${finolier.id}`}>
                    {new Intl.NumberFormat().format(finolier.numPosts)}
                  </Link>
                </td>
                <td className="px-2 py-4 text-center whitespace-nowrap text-white">
                  <Link href={`/finolier/${finolier.id}`}>
                    {new Intl.NumberFormat().format(finolier.numLikesReceived)}
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
