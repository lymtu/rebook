import { useAuthContext } from "@/lib/context/auth/authContext";

export default function Index() {
  const { info } = useAuthContext();

  return (
    <div className="flex flex-col items-center justify-center h-full">
      {info.username ? (
        <h1 className="text-3xl font-bold">欢迎，{info.username}!</h1>
      ) : (
        <h1 className="text-3xl font-bold">请先登录</h1>
      )}
    </div>
  );
}
