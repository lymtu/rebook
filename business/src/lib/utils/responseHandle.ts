import { useCallback } from "react";
import { useAlertContext } from "../context/alert/alertContext";
import { useAuthContext } from "@/lib/context/auth/authContext";

type Response = {
  code: number;
  msg?: string;
  data?: unknown;
};

export const useResponseHandle = () => {
  const { setInfo } = useAuthContext();

  return useCallback(
    (res: Response) => {
      if (res.code >= 500) {
        throw new Error("服务器错误");
      }

      if (res.code === 401) {
        setInfo({
          username: "",
          root: [],
        });
        throw new Error("认证失败，请重新登录");
      }

      if (res.code >= 400) {
        throw new Error("未授权");
      }

      if (res.code !== 200) {
        throw new Error(res.msg);
      }

      return res.data;
    },
    [setInfo]
  );
};

export const useErrorHandle = () => {
  const { addAlert } = useAlertContext();
  return useCallback(
    (err: Error) => {
      addAlert({
        type: "error",
        message: err.message,
        id: Date.now(),
      });
    },
    [addAlert]
  );
};
