import type { Notice } from "@/lib/types/notice";
import PopupWindow from "@/components/popupWindow";
import { useAlertContext } from "@/lib/context/alert/alertContext";
import { useCallback } from "react";
import { useErrorHandle, useResponseHandle } from "@/lib/utils/responseHandle";

export default function Delete({
  id,
  title,
  closeWindowHandler,
}: {
  id: Notice["id"];
  title: Notice["title"];
  closeWindowHandler: () => void;
}) {
  const { addAlert } = useAlertContext();
  const errorHandle = useErrorHandle();
  const responseHandle = useResponseHandle();

  const submitHandle = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      fetch(import.meta.env.VITE_SERVER_URL + "/admin/notice", {
        credentials: "include",
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
        }),
      })
        .then((res) => res.json())
        .then(responseHandle)
        .then(() => {
          addAlert({
            type: "success",
            message: "删除成功",
            id: Date.now(),
          });
          location.reload();
        })
        .catch(errorHandle);
    },
    [addAlert, id, errorHandle, responseHandle]
  );

  return (
    <PopupWindow closeWindow={closeWindowHandler}>
      <form
        action=""
        onSubmit={submitHandle}
        className="bg-white dark:bg-gray-800 rounded-lg"
      >
        <div>
          <p className="text-lg font-bold">确认删除公告 《{title}》？</p>
        </div>

        <div className="flex justify-around mt-10">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              closeWindowHandler();
            }}
          >
            取消
          </button>
          <button
            type="submit"
            className="btn not-dark:btn-soft dark:text-gray-200 btn-secondary"
          >
            确认删除？
          </button>
        </div>
      </form>
    </PopupWindow>
  );
}
