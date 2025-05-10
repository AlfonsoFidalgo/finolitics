import { type Dispatch, type SetStateAction, useEffect } from "react";
import { saveUser, fetchUser } from "@/actions/utils";

function generateUserId() {
  return `user_${Math.random().toString(36).substr(2, 9)}`;
}

export default function useStoreUserId(
  setUserId: Dispatch<SetStateAction<string | null>>
) {
  useEffect(() => {
    async function handleUserStorage() {
      if (typeof window === "undefined" || !window.localStorage) return;
      try {
        let storedUserId = window.localStorage.getItem("userId");
        if (storedUserId) {
          const resUserId = await fetchUser(storedUserId);
          if (!resUserId.success) {
            storedUserId = null;
          }
        }
        if (!storedUserId) {
          storedUserId = generateUserId();
          window.localStorage.setItem("userId", storedUserId);
          try {
            await saveUser(storedUserId);
          } catch (error) {
            console.error("Failed to save user:", error);
          }
        }
        setUserId(storedUserId);
      } catch (error) {
        console.error("Error handling user storage:", error);
      }
    }
    handleUserStorage();
  }, [setUserId]);
}
