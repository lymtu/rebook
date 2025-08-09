import type { Notice } from "@/lib/types/notice";
import PopupWindow from "@/components/popupWindow";
import NoticeFormTemplate from "./formTemplate";
import { useAlertContext } from "@/lib/context/alert/alertContext";
import { useEffect, useState } from "react";
import { useErrorHandle, useResponseHandle } from "@/lib/utils/responseHandle";

export default function View({
  id,
  closeWindowHandler,
}: {
  id: Notice["id"];
  closeWindowHandler: () => void;
}) {
  const { addAlert } = useAlertContext();
  const [noticeInfo, setNoticeInfo] = useState<Notice | null>(null);

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
    fetch(import.meta.env.VITE_SERVER_URL + "/notice/" + id)
      .then((res) => res.json())
      .then(responseHandle)
      .then((data) => {
        setNoticeInfo(data as Notice);
      })
      .catch(errorHandle);
  }, [id, addAlert, errorHandle, responseHandle]);

  return (
    <PopupWindow closeWindow={closeWindowHandler}>
      {noticeInfo ? (
        <div className="p-2">
          <h2 className="mb-4 text-center text-2xl font-bold">查看公告详情</h2>
          <NoticeFormTemplate
            title={noticeInfo.title}
            content={noticeInfo.content}
            editType={false}
          />

          <button
            className="mt-6 mx-auto block btn btn-error btn-wide not-dark:btn-soft not-dark:hover:text-white dark:text-white"
            type="button"
            onClick={closeWindowHandler}
          >
            关闭窗口
          </button>
        </div>
      ) : (
        <span className="loading loading-spinner loading-md"></span>
      )}
    </PopupWindow>
  );
}
