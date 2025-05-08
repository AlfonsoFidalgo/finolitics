import { fetchTopUpvoted } from "@/actions/utils";
import Table from "@/components/UI/table";

export default async function Home() {
  const topUpvoted = await fetchTopUpvoted();

  return (
    <>
      <div className="my-6 sm:my-10 w-full sm:w-8/12 mx-auto">
        <h1 className="text-center text-2xl font-semibold mb-4">
          Top 10 Finoliers más populares
        </h1>
        <Table
          data={topUpvoted}
          columns={["Finolier", "Reputación", "Comentarios", "Ratio Upvotes"]}
        />
      </div>
    </>
  );
}
