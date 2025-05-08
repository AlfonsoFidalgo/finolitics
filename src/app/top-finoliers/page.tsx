import { fetchTopUpvoted } from "@/actions/utils";
import Table from "@/components/UI/table";

export default async function Home() {
  const topUpvoted = await fetchTopUpvoted();

  return (
    <>
      <div className="my-6 sm:my-10 w-full sm:w-8/12 mx-auto">
        <Table
          data={topUpvoted}
          columns={["Finolier", "Reputación", "Comentarios", "Upvotes"]}
        />
      </div>
    </>
  );
}
