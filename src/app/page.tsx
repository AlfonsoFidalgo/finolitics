import FinolierForm from "@/components/finolierForm";

export default function FinolierSearch() {
  return (
    <div className="flex flex-col items-center justify-center mt-6 sm:mt-10">
      <h1 className="text-2xl w-11/12 sm:w-8/12 text-center">
        Tu sitio de confianza para saber más sobre tus finoliers favoritos,
        darles cariño y poder perder aún más el tiempo.
      </h1>
      <FinolierForm />
    </div>
  );
}
