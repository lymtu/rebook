import { Outlet, Link, useNavigate } from "react-router";
import ThemeBtn from "@/components/themeBtn";

import {
  useAuthContext,
  type AuthInfoType,
} from "./lib/context/auth/authContext";
import { useAlertContext } from "@/lib/context/alert/alertContext";

import RouteAside from "@/components/routeAside";
import { useEffect } from "react";

export default function Layout() {
  const { info, setInfo } = useAuthContext();
  const nav = useNavigate();

  useEffect(() => {
    if (!info.username) {
      nav("/signin");
    }
  }, [info, nav]);

  return (
    <div
      id="myRoot"
      className="relative h-screen bg-gray-100 dark:bg-gray-900 dark:text-white transition-colors duration-200 flex flex-col"
    >
      <Header info={info} setInfo={setInfo} />
      <div className="flex-1 overflow-auto">
        <div className="flex items-stretch h-full">
          <div className="w-[300px] hidden px-2 shadow lg:block 2xl:w-[400px]">
            <RouteAside />
          </div>
          <div className="flex-1">
            {info.root.includes("admin:view") ? (
              <div className="h-full p-6 overflow-y-auto overflow-x-hidden">
                <Outlet />
              </div>
            ) : (
              <div className="h-full text-xl flex items-center justify-center">
                <Link to={"/signin"} className="link link-primary mr-2">
                  登录
                </Link>
                以获取查看权限
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Header({
  info,
  setInfo,
}: {
  info: AuthInfoType;
  setInfo: ({ username, root }: AuthInfoType) => void;
}) {
  const { addAlert } = useAlertContext();

  return (
    <div className="z-10 bg-blue-900 dark:bg-blue-950 text-white transition-colors px-6 py-3 flex items-center justify-between">
      <Link to={"/"} className="flex gap-2">
        <div className="text-2xl font-bold">二手书</div>
        <div className="hidden md:block text-sm">管理页</div>
      </Link>

      <div className="flex items-center gap-6">
        <ThemeBtn />
        <div className="w-1 h-8 rounded-xl bg-white/40 mr-2"></div>
        {info.username ? (
          <>
            <Link to={"/admin"} className="font-bold text-white">
              {info.username}
            </Link>
            <button
              className="btn btn-warning btn-sm text-white"
              onClick={() => {
                fetch(import.meta.env.VITE_SERVER_URL + "/admin/signout", {
                  credentials: "include",
                })
                  .then((res) => res.json())
                  .then((res) => {
                    if (res.code === 200) {
                      addAlert({
                        type: "success",
                        message: "登出成功",
                        id: Date.now(),
                      });
                      setInfo({ username: "", root: [] });
                      return;
                    }

                    addAlert({
                      type: "error",
                      message: res.message,
                      id: Date.now(),
                    });
                  });
              }}
            >
              登出
            </button>
          </>
        ) : (
          <Link to={"/signin"} className="btn btn-accent text-white">
            登录
          </Link>
        )}
      </div>
    </div>
  );
}
