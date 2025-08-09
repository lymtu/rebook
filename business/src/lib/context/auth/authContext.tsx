import { createContext, useContext } from "react";

export type AuthInfoType = {
  username: string;
  root: string[];
};

export const AuthContext = createContext<{
  info: AuthInfoType;
  setInfo: (info: AuthInfoType) => void;
}>({
  info: {
    username: "",
    root: [],
  },
  setInfo: () => {},
});

export const useAuthContext = () => {
  return useContext(AuthContext);
};
