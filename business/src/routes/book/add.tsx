import { useCallback, useState } from "react";
import { useAlertContext } from "@/lib/context/alert/alertContext";
import { useErrorHandle, useResponseHandle } from "@/lib/utils/responseHandle";

export default function BookAdd() {
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [imgFileList, setImgFileList] = useState<File[] | null>(null);
  const [category, setCategory] = useState<string>("0");
  const [isLoading, setIsLoading] = useState(false);

  const isShow = coverFile || (imgFileList && imgFileList.length > 0);

  const { addAlert } = useAlertContext();
  const errorHandle = useErrorHandle();
  const responseHandle = useResponseHandle();

  const submitHandle = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setIsLoading(true);

      const formData = new FormData(e.target as HTMLFormElement);

      for (const item of [
        { name: "name", label: "书名" },
        { name: "author", label: "作者名" },
        { name: "price", label: "价格" },
        { name: "category", label: "分类" },
      ]) {
        if (formData.get(item.name) === "") {
          document.getElementById(item.name)?.focus();
          addAlert({
            type: "error",
            message: `${item.label}不能为空`,
            id: Date.now(),
          });
          setIsLoading(false);
          return;
        }
      }

      if (!coverFile) {
        addAlert({
          type: "error",
          message: "请选择封面图片",
          id: Date.now(),
        });
        setIsLoading(false);
        return;
      }

      formData.append("coverSrc", coverFile.name);

      if (!imgFileList || imgFileList.length === 0) {
        addAlert({
          type: "error",
          message: "请选择图片",
          id: Date.now(),
        });
        setIsLoading(false);
        return;
      }

      const imgSrc: string[] = [];
      imgFileList.forEach((file) => {
        imgSrc.push(file.name);
      });
      formData.append("imgSrc", JSON.stringify(imgSrc));

      fetch(import.meta.env.VITE_SERVER_URL + "/admin/book", {
        credentials: "include",
        method: "POST",
        body: formData,
      })
        .then((res) => res.json())
        .then(responseHandle)
        .then(() => {
          addAlert({
            type: "success",
            message: "添加成功",
            id: Date.now(),
          });

          (e.target as HTMLFormElement).reset();
          setCoverFile(null);
          setImgFileList(null);
          setIsLoading(false);
        })
        .catch(errorHandle);
    },
    [addAlert, coverFile, imgFileList, errorHandle, responseHandle]
  );

  return (
    <div
      className={
        "h-full lg:flex items-center " +
        (isShow ? "gap-10 justify-around" : "justify-center")
      }
    >
      <form
        action=""
        className="*:not-first:mt-6"
        onSubmit={submitHandle}
        onReset={() => {
          setCoverFile(null);
          setImgFileList(null);
        }}
      >
        <input
          name="id"
          type="text"
          hidden
          defaultValue={
            category + "-" + (((Date.now() - Number(new Date("0"))) / 1000) | 0)
          }
        />
        <div>
          <label htmlFor="name">书名：</label>
          <input
            className="input input-md mt-2 dark:bg-gray-700 dark:focus:border-white"
            type="text"
            name="name"
            id="name"
            placeholder="请输入书名"
          />
        </div>

        <div>
          <label htmlFor="author">作者名：</label>
          <input
            className="input input-md mt-2 dark:bg-gray-700 dark:focus:border-white"
            type="text"
            name="author"
            id="author"
            placeholder="请输入作者"
          />
        </div>

        <div className="flex gap-8">
          <div>
            <label className="block" htmlFor="price">
              价格：
            </label>
            <input
              className="input w-36 input-md mt-2 dark:bg-gray-700 dark:focus:border-white"
              type="number"
              name="price"
              id="price"
              placeholder="请输入价格"
            />
          </div>
          <div>
            <label htmlFor="bookType">类型：</label>
            <select
              id="bookType"
              name="category"
              onChange={(e) => setCategory(e.target.value)}
              className="select mt-2 dark:bg-gray-700 dark:focus:border-white"
            >
              <option disabled={true}>选择类型</option>
              <option value={"0"}>文学小说</option>
              <option value={"1"}>历史社科</option>
              <option value={"2"}>学习教育</option>
              <option value={"3"}>科技科普</option>
              <option value={"4"}>艺术生活</option>
              <option value={"5"}>课程相关</option>
              <option value={"6"}>其他</option>
            </select>
          </div>
        </div>

        <div className="flex justify-around gap-8">
          <label htmlFor="cover" className="btn not-dark:btn-soft btn-primary">
            选择封面图片
          </label>
          <input
            id="cover"
            accept="image/*"
            name="coverSrcFile"
            type="file"
            hidden
            onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
          />
          <label
            htmlFor="imgList"
            className="btn not-dark:btn-soft btn-info not-dark:hover:text-white dark:text-white"
          >
            选择更多图片
          </label>
          <input
            id="imgList"
            accept="image/*"
            name="imgSrcFile"
            type="file"
            multiple
            hidden
            onChange={(e) => {
              if (e.target.files && e.target.files?.length > 0) {
                setImgFileList([...e.target.files]);
              } else {
                setImgFileList(null);
              }
            }}
          />
        </div>

        <div className="">
          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={isLoading}
          >
            {isLoading && <span className="loading loading-spinner"></span>}
            提交
          </button>
          <button type="reset" className="mx-auto block cursor-pointer mt-4">
            清空
          </button>
        </div>
      </form>

      <div
        className={
          "h-full flex flex-col justify-center gap-4 duration-150 transition-all overflow-x-hidden " +
          (isShow ? "w-[300px]" : "w-0")
        }
      >
        {isShow && (
          <>
            <h3 className="text-lg font-bold text-center">预览</h3>
            {coverFile && (
              <>
                <span>封面图片</span>
                <div className="w-32 h-48 mx-auto">
                  <img
                    className="w-full h-full object-cover"
                    src={
                      URL.createObjectURL
                        ? URL.createObjectURL(coverFile)
                        : window.webkitURL.createObjectURL(coverFile)
                    }
                    alt=""
                  />
                </div>
              </>
            )}
            {imgFileList && (
              <>
                <span>详情图片</span>
                <div className="w-[300px] overflow-y-auto grid h-48 grid-cols-2">
                  {imgFileList?.map((imgFile, index) => (
                    <div
                      key={imgFile.name}
                      className="group w-32 h-48 relative"
                    >
                      <img
                        className="w-full h-full object-cover"
                        src={
                          URL.createObjectURL
                            ? URL.createObjectURL(imgFile)
                            : window.webkitURL.createObjectURL(imgFile)
                        }
                        alt=""
                      />

                      <div className="hidden group-hover:flex flex-col gap-6 justify-center items-center absolute top-0 right-0 w-full h-full bg-black/50">
                        <button
                          type="button"
                          className="btn btn-success not-dark:btn-soft not-dark:hover:text-white dark:text-white"
                          onClick={() => {
                            setImgFileList((prev) => {
                              if (index === 0 || !prev) return prev;
                              return [...prev.splice(index, 1), ...prev];
                            });
                          }}
                        >
                          移到最前
                        </button>
                        <button
                          type="button"
                          className="btn btn-error not-dark:btn-soft not-dark:hover:text-white dark:text-white"
                          onClick={() => {
                            setImgFileList((prev) => {
                              if (!prev) return prev;
                              prev.splice(index, 1);
                              return [...prev];
                            });
                          }}
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
