export default function FinolierVote() {
  return (
    <div className="flex gap-4 mt-4">
      <button className="bg-green-500 text-white px-4 py-2 rounded shadow-md hover:bg-green-600">
        Me cae bien
      </button>
      <button className="bg-slate-500 text-white px-4 py-2 rounded shadow-md hover:bg-slate-600">
        No sé quién es
      </button>
      <button className="bg-red-500 text-white px-4 py-2 rounded shadow-md hover:bg-red-600">
        Me cae mal
      </button>
    </div>
  );
}
