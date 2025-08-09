import type { Book } from "@/lib/types/book";
import PopupWindow from "@/components/popupWindow";
import BookFormTemplate from "./formTemplate";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAlertContext } from "@/lib/context/alert/alertContext";
import { useErrorHandle, useResponseHandle } from "@/lib/utils/responseHandle";

export default function Edit({
  id,
  closeWindowHandler,
}: {
  id: Book["id"];
  closeWindowHandler: () => void;
}) {
  const { addAlert } = useAlertContext();
  const changeInfo = useRef<{
    name: Book["name"] | null;
    author: Book["author"] | null;
    price: Book["price"] | null;
    coverSrc: Book["coverSrc"] | null;
    imgSrc: Book["imgSrc"] | null;
  }>({
    name: null,
    author: null,
    price: null,
    coverSrc: null,
    imgSrc: null,
  });
  const imgFileRef = useRef<{
    coverSrc: File | null;
    imgSrc: File[] | null;
  }>({
    coverSrc: null,
    imgSrc: null,
  });
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

  const submitHandle = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!bookInfo) return;
      let isEdited = false;
      const formData = new FormData();
      formData.append("id", bookInfo.id);
      for (const key in changeInfo.current) {
        const value =
          changeInfo.current[key as keyof typeof changeInfo.current];
        if (value === null) continue;
        isEdited = true;
        if (typeof value === "string") {
          formData.append(key, value);
        } else if (typeof value === "number") {
          formData.append(key, value.toString());
        } else {
          formData.append(key, JSON.stringify(value));
        }
      }

      if (!isEdited) {
        addAlert({
          type: "warning",
          message: "没有修改内容",
          id: Date.now(),
        });
        return;
      }

      if (imgFileRef.current.coverSrc) {
        formData.append("coverSrcFile", imgFileRef.current.coverSrc);
      }

      if (imgFileRef.current.imgSrc) {
        imgFileRef.current.imgSrc.forEach((item) => {
          formData.append("imgSrcFile", item);
        });
      }

      fetch(import.meta.env.VITE_SERVER_URL + "/admin/book", {
        method: "PUT",
        credentials: "include",
        body: formData,
      })
        .then((res) => res.json())
        .then(responseHandle)
        .then(() => {
          addAlert({
            type: "success",
            message: "修改成功",
            id: Date.now(),
          });

          location.reload();
        })
        .catch(errorHandle);
    },
    [addAlert, bookInfo, errorHandle, responseHandle]
  );

  const infoChangeHandle = useCallback(
    (key: "name" | "author" | "price", value: string | number) => {
      if (!bookInfo || value === "" || value === null) return;

      (changeInfo.current[key] as (typeof changeInfo.current)[typeof key]) =
        value;
    },
    [bookInfo]
  );

  const coverChangeHandle = useCallback(
    (fileInfo: File) => {
      if (!fileInfo) {
        addAlert({
          type: "error",
          message: "文件错误",
          id: Date.now(),
        });
        return;
      }

      changeInfo.current.coverSrc = fileInfo.name;
      imgFileRef.current.coverSrc = fileInfo;
    },
    [addAlert]
  );

  const imgChangeHandle = useCallback(
    (fileInfoList: (string | File)[]) => {
      if (!fileInfoList) {
        addAlert({
          type: "error",
          message: "文件错误",
          id: Date.now(),
        });
        return;
      }

      changeInfo.current.imgSrc = fileInfoList.map((item) => {
        if (typeof item === "string") {
          return item;
        }

        return item.name;
      });
      imgFileRef.current.imgSrc = fileInfoList.filter(
        (item) => item instanceof File
      );
    },
    [addAlert]
  );

  return (
    <PopupWindow closeWindow={closeWindowHandler}>
      {bookInfo ? (
        <form action="" className="p-2" onSubmit={submitHandle}>
          <h2 className="mb-4 text-center text-2xl font-bold">编辑书籍信息</h2>
          <BookFormTemplate
            info={bookInfo}
            editType={true}
            infoChangeHandle={infoChangeHandle}
            coverChangeHandle={coverChangeHandle}
            imgChangeHandle={imgChangeHandle}
          />

          <div className="flex justify-around mt-6">
            <button
              className="btn btn-error btn-wide not-dark:btn-soft not-dark:hover:text-white dark:text-white"
              type="button"
              onClick={closeWindowHandler}
            >
              关闭窗口
            </button>
            <button
              className="btn btn-info btn-wide not-dark:btn-soft not-dark:hover:text-white dark:text-white"
              type="submit"
            >
              提交修改
            </button>
          </div>
        </form>
      ) : (
        <span className="loading loading-spinner loading-md"></span>
      )}
    </PopupWindow>
  );
}
