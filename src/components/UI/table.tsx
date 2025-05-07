import { type Finolier } from "@/actions/disqus";
import Image from "next/image";

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
      <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            {columns.map((col) => {
              return (
                <th key={col} scope="col" className="px-6 py-3 text-center">
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
                key={finolier.displayName}
                className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200"
              >
                <th
                  scope="row"
                  className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white flex flex-col items-center gap-2"
                >
                  <div>{finolier.displayName}</div>
                  <Image
                    className="rounded-full"
                    src={finolier.avatar}
                    alt="avatar"
                    width={50}
                    height={50}
                  />
                </th>
                <td className="px-6 py-4 text-center">
                  {finolier.reputation.toFixed(2)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
