import { type Dispatch, type SetStateAction, useEffect } from "react";
import { saveUser, isUserInDB } from "@/actions/users";

function generateUserId() {
  return `${Math.random().toString(36).slice(2)}`;
}

export default function useStoreUserId(
  userIdLocalStorage: string | null,
  setUserId: Dispatch<SetStateAction<string | null>>
) {
  useEffect(() => {
    let isMounted = true;

    async function handleUserStorage() {
      console.log("in handleUserStorage");

      if (typeof window === "undefined" || !window.localStorage) return;
      try {
        let newUserId: string | null = userIdLocalStorage;
        let userInDB = false;
        if (newUserId) {
          // userId exists in localStorage, we need to check if it's in the DB
          userInDB = await isUserInDB(newUserId);
        }

        if (!newUserId || !userInDB) {
          // userId doesn't exist in localStorage or not in DB, generate a new one
          console.log(
            "No userId found in localStorage or not in DB, generating a new one"
          );

          newUserId = generateUserId();
          window.localStorage.setItem("userId", newUserId);
          try {
            await saveUser(newUserId);
          } catch (error) {
            console.error("Failed to save user:", error);
          }
        }
        if (isMounted) {
          setUserId(newUserId);
        }
      } catch (error) {
        console.error("Error handling user storage:", error);
      }
    }
    handleUserStorage();
    return () => {
      isMounted = false;
    };
  }, [userIdLocalStorage, setUserId]);
}
