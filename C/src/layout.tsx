import Header from "@/components/header";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen w-screen overflow-hidden">
      <div className="h-full flex flex-col bg-[url(/background.webp)] bg-cover bg-center">
        <Header />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
