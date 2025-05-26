// export const revalidate = 60;
import { fetchMostActiveLast7Days } from "@/actions";
import Table from "@/components/UI/table";

export default async function Home() {
  const mostActive = await fetchMostActiveLast7Days();

  return (
    <>
      <div className="my-6 sm:my-10 w-9/12 sm:w-8/12 mx-auto">
        <h1 className="text-center text-xl sm:text-3xl font-semibold mb-2 sm:mb-6">
          Finoliers más activos en los últimos días
        </h1>
        <Table
          data={mostActive}
          columns={["Finolier", "Comentarios", "Upvotes", "Reputación"]}
        />
      </div>
    </>
  );
}
