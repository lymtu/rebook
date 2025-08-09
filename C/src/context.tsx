import { UserContextProvider } from "@/lib/context/userContext/provider";

export default function ContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <UserContextProvider>{children}</UserContextProvider>;
}
