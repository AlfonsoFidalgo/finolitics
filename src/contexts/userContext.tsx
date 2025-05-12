"use client";

import { createContext, useState, useContext } from "react";

interface UserContextProviderProps {
  children: React.ReactNode;
}

interface UserContextType {
  userId: string | null;
  setUserId: React.Dispatch<React.SetStateAction<string | null>>;
}

const UserContext = createContext<UserContextType | null>(null);

export const UserContextProvider = ({ children }: UserContextProviderProps) => {
  const getUserId = () => {
    if (typeof window === "undefined" || !window.localStorage) return null;
    return window.localStorage.getItem("userId");
  };
  const [userId, setUserId] = useState<string | null>(getUserId);

  return (
    <UserContext.Provider value={{ userId, setUserId }}>
      {children}
    </UserContext.Provider>
  );
};

export function useUserContext() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserContextProvider");
  }
  return context;
}
