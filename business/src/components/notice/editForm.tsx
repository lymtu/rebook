import type { Notice } from "@/lib/types/notice";
import PopupWindow from "@/components/popupWindow";
import NoticeFormTemplate from "./formTemplate";
import { useAlertContext } from "@/lib/context/alert/alertContext";
import { useCallback, useEffect, useState } from "react";
import { useErrorHandle, useResponseHandle } from "@/lib/utils/responseHandle";

export default function Edit({
  id,
  closeWindowHandler,
}: {
  id: Notice["id"];
  closeWindowHandler: () => void;
}) {
  const { addAlert } = useAlertContext();
  const [noticeInfo, setNoticeInfo] = useState<Notice | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const errorHandle = useErrorHandle();
  const responseHandle = useResponseHandle();

  useEffect(() => {
    if (!id) {
      addAlert({
        type: "error",
        message: "路径错误",
        id: Date.now(),
      });
      return;
    }
    setIsLoading(true);
    fetch(import.meta.env.VITE_SERVER_URL + "/notice/" + id)
      .then((res) => res.json())
      .then(responseHandle)
      .then((data) => {
        setNoticeInfo(data as Notice);
        setIsLoading(false);
      })
      .catch(errorHandle);
  }, [id, addAlert, errorHandle, responseHandle]);

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
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          id,
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
        })
        .catch(errorHandle);
    },
    [id, addAlert, responseHandle, errorHandle]
  );

  return (
    <PopupWindow closeWindow={closeWindowHandler}>
      {noticeInfo ? (
        <div className="p-2">
          <h2 className="mb-4 text-center text-2xl font-bold">查看公告详情</h2>
          <NoticeFormTemplate
            title={noticeInfo.title}
            content={noticeInfo.content}
            submitHandle={submitHandle}
            editType
          >
            <button
              className="btn btn-primary btn-wide mx-auto block"
              type="submit"
              disabled={isLoading}
            >
              {isLoading && <span className="loading loading-spinner"></span>}
              提交
            </button>
          </NoticeFormTemplate>
        </div>
      ) : (
        <span className="loading loading-spinner loading-md"></span>
      )}
    </PopupWindow>
  );
}
