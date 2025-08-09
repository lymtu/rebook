import { useCallback, useState } from "react";
import { AuthContext } from "./authContext";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [info, setInfo_] = useState<{
    username: string;
    root: string[];
  }>(() =>
    JSON.parse(
      window.sessionStorage.getItem("info") || '{"username": "", "root": []}'
    )
  );

  const setInfo = useCallback((info: { username: string; root: string[] }) => {
    if (info.username === "") {
      window.sessionStorage.removeItem("info");
    } else {
      window.sessionStorage.setItem("info", JSON.stringify(info));
    }
    setInfo_(info);
  }, []);

  return (
    <AuthContext.Provider value={{ info, setInfo }}>
      {children}
    </AuthContext.Provider>
  );
}
