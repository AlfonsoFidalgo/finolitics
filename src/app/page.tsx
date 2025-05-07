import {
  fetchTopReputationFinoliers,
  fetchTopComentators,
  fetchTopUpvoted,
} from "@/actions/utils";
import Table from "@/components/UI/table";

export default async function Home() {
  // const topReputationFinoliers = await fetchTopReputationFinoliers();
  // const topComentators = await fetchTopComentators();
  const topUpvoted = await fetchTopUpvoted();

  return (
    <>
      <div className="flex flex-col items-center justify-center mt-8">
        <h1 className="text-xl mt-2 w-11/12 sm:w-8/12">
          Finolitics, tu herramienta de confianza para saber más sobre tus
          finoliers favoritos y poder perder aún más el tiempo.
        </h1>
      </div>
      <div className="mt-8 w-full sm:w-8/12 mx-auto">
        <Table data={topUpvoted} />
      </div>
    </>
  );
}
