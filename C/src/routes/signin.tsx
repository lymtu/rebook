import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/signin")({
  component: RouteComponent,
});

const reg = new RegExp(
  /^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/
);

function RouteComponent() {
  return (
    <div className="h-full flex flex-col items-center justify-center">
      <div className="backdrop-blur-md bg-white/30 p-10 rounded-md w-1/2">
        <h1 className="text-3xl font-bold text-center">登录</h1>

        <form action="" className="">
          <div className="flex flex-col items-center justify-center mt-10">
            <input
              type="text"
              placeholder="Email"
              className="w-96 p-2 border border-gray-300 rounded-md"
            />
            <input
              type="password"
              placeholder="Password"
              className="w-96 p-2 border border-gray-300 rounded-md mt-4"
            />
            <button
              type="submit"
              className="w-96 p-2 mt-4 bg-blue-500 text-white rounded-md"
            >
              Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
