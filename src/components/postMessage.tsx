import { decode } from "he";

export default function PostMessage({ message }: { message: string }) {
  return (
    <p className="text-md text-gray-700 wrap-anywhere">{decode(message)}</p>
  );
}
