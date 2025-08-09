import { createContext, useContext } from "react";

export type User = {
  name: string;
  email: string;
  address: string[];
};

export const userContext = createContext<{
  info: User | null;
  setInfo: ((info: User) => void) | null;
}>({
  info: null,
  setInfo: null,
});

export const useUserContext = () => useContext(userContext);
