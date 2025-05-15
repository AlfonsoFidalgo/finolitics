import { LockIcon } from "@/components/UI/icons";

export default function PrivateFinolier() {
  return (
    <div className="flex flex-col items-center gap-2 justify-center">
      <p className="text-gray-700">Finolier privado</p>
      <LockIcon className="size-6 fill-gray-700" />
    </div>
  );
}
