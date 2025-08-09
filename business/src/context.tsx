import { AuthProvider } from "@/lib/context/auth/authProvider";
import { ThemeProvider } from "@/lib/context/themeState/themeProvider";
import { AlertProvider } from "@/lib/context/alert/alertProvider";

export default function ContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AlertProvider>{children}</AlertProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
