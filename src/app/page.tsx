import prisma from "@/db";

export default async function Home() {
  const finoliers = await prisma.user.findMany();
  console.log(finoliers);

  return (
    <div>
      <h1 className="text-3xl font-bold pt-8 text-center">Wikifinoliers</h1>
      <form className="flex flex-col items-center justify-center mt-8">
        <input
          type="text"
          placeholder="Search for a finolier..."
          className="border border-gray-300 rounded-lg p-2 w-1/2"
        />
        <button className="bg-blue-500 text-white rounded-lg p-4 mt-4 w-1/4">
          Search
        </button>
      </form>
    </div>
  );
}
