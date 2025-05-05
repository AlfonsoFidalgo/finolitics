import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-slate-800 text-white p-4 flex items-center justify-between">
      <h1 className="text-3xl font-bold font-mono tracking-wider uppercase">
        <Link href="/" className="text-white hover:text-gray-300">
          Finolitics
        </Link>
      </h1>
      <div className="flex gap-8 mx-8">
        <Link
          href="/buscar"
          className="text-lg font-semibold hover:text-gray-300 transition duration-300"
        >
          Buscar
        </Link>
        <Link
          href="/listado"
          className="ml-4 text-lg font-semibold hover:text-gray-300 transition duration-300"
        >
          Listado
        </Link>
      </div>
    </header>
  );
}
