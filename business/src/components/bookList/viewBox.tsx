import type { Book } from "@/lib/types/book";
import PopupWindow from "@/components/popupWindow";
import BookFormTemplate from "./formTemplate";
import { useAlertContext } from "@/lib/context/alert/alertContext";
import { useEffect, useState } from "react";
import { useErrorHandle, useResponseHandle } from "@/lib/utils/responseHandle";

export default function View({
  id,
  closeWindowHandler,
}: {
  id: Book["id"];
  closeWindowHandler: () => void;
}) {
  const { addAlert } = useAlertContext();
  const [bookInfo, setBookInfo] = useState<Book | null>(null);

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
    fetch(import.meta.env.VITE_SERVER_URL + "/book/" + id)
      .then((res) => res.json())
      .then(responseHandle)
      .then((data) => {
        setBookInfo(data as Book);
      })
      .catch(errorHandle);
  }, [id, addAlert, errorHandle, responseHandle]);

  return (
    <PopupWindow closeWindow={closeWindowHandler}>
      {bookInfo ? (
        <div className="p-2">
          <h2 className="mb-4 text-center text-2xl font-bold">查看书籍详情</h2>
          <BookFormTemplate info={bookInfo} editType={false} />

          <button
            className="mt-6 mx-auto block btn btn-error btn-wide not-dark:btn-soft not-dark:hover:text-white dark:text-white"
            type="button"
            onClick={() => {
              closeWindowHandler();
            }}
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
