import { useState } from "react";
import { userContext, type User } from "./context";

export const UserContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [info, setInfo] = useState<User | null>(null);
  return (
    <userContext.Provider
      value={{
        info,
        setInfo,
      }}
    >
      {children}
    </userContext.Provider>
  );
};
