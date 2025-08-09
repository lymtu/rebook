import { useCallback, useState } from "react";
import { useAlertContext } from "@/lib/context/alert/alertContext";
import { useResponseHandle, useErrorHandle } from "@/lib/utils/responseHandle";
import NoticeFormTemplate from "@/components/notice/formTemplate";

export default function AddNotice() {
  const { addAlert } = useAlertContext();
  const responseHandle = useResponseHandle();
  const errorHandle = useErrorHandle();
  const [isLoading, setIsLoading] = useState(false);

  const submitHandle = useCallback(
    async ({ title, content }: { title: string; content: string }) => {
      if (title === "" || content === "" || /^\s*$/.test(content)) {
        addAlert({
          type: "error",
          message: "标题或内容不能为空",
          id: Date.now(),
        });
        return;
      }

      setIsLoading(true);
      return await fetch(import.meta.env.VITE_SERVER_URL + "/admin/notice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          title,
          content,
        }),
      })
        .then((res) => res.json())
        .then(responseHandle)
        .then(() => {
          addAlert({
            type: "success",
            message: "添加成功",
            id: Date.now(),
          });
          setIsLoading(false);
          return true;
        })
        .catch(errorHandle);
    },
    [addAlert, responseHandle, errorHandle]
  );

  return (
    <NoticeFormTemplate editType submitHandle={submitHandle}>
      <button
        className="btn btn-primary btn-wide mx-auto block"
        type="submit"
        disabled={isLoading}
      >
        {isLoading && <span className="loading loading-spinner"></span>}
        提交
      </button>
    </NoticeFormTemplate>
  );
}
