import type { Book } from "@/lib/types/book";
import { formatTime } from "@/lib/utils/TimeFormatConverter";
import { useState } from "react";

export default function BookInfoTemplate({
  info,
  editType,
  infoChangeHandle,
  coverChangeHandle,
  imgChangeHandle,
}: {
  info: Book;
  editType: boolean;
  infoChangeHandle?: (
    key: "name" | "author" | "price",
    value: string | number
  ) => void;
  coverChangeHandle?: ((fileInfo: File) => void) | undefined;
  imgChangeHandle?: ((fileInfoList: (string | File)[]) => void) | undefined;
}) {
  const [coverSrc, setCoverSrc] = useState<string>(
    import.meta.env.VITE_SERVER_URL + info.coverSrc
  );
  const [imgSrcList, setImgSrcList] = useState<(string | File)[]>(info.imgSrc);
  return (
    <div className="md:flex gap-6 md:gap-20">
      <section className="px-4 md:flex flex-col justify-center gap-6 md:text-lg *:w-80">
        <div>
          <label htmlFor="bookName">书籍名称：</label>
          <input
            type="text"
            id="bookName"
            className="input mt-2 dark:bg-gray-700 dark:focus:border-white"
            defaultValue={info.name}
            readOnly={!editType}
            onChange={(e) => {
              infoChangeHandle?.("name", e.target.value);
            }}
          />
        </div>
        <div>
          <label htmlFor="bookAuthor">作者：</label>
          <input
            type="text"
            id="bookAuthor"
            className="input mt-2 dark:bg-gray-700 dark:focus:border-white"
            readOnly={!editType}
            defaultValue={info.author}
            onChange={(e) => {
              infoChangeHandle?.("author", e.target.value);
            }}
          />
        </div>
        <div className="flex items-center justify-between gap-6">
          <div className="w-1/3">
            <label htmlFor="bookPrice">售价</label>
            <input
              type="number"
              id="bookPrice"
              className="input validator mt-2 dark:bg-gray-700 dark:focus:border-white"
              defaultValue={info.price}
              readOnly={!editType}
              onChange={(e) => {
                infoChangeHandle?.("price", Number(e.target.value));
              }}
            />
          </div>
          <div className="">
            <label htmlFor="bookType">类型</label>
            {editType ? (
              <select
                id="bookType"
                name="category"
                className="select mt-2 dark:bg-gray-700 dark:focus:border-white"
              >
                <option disabled={true} className="dark:bg-gray-700">
                  选择类型
                </option>
                {Object.keys(categoryList).map((item) => (
                  <option value={item} key={item} className="dark:bg-gray-700">
                    {categoryList[item as keyof typeof categoryList]}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                className="input mt-2 dark:bg-gray-700 dark:focus:border-white"
                value={categoryList[info.category as keyof typeof categoryList]}
                readOnly
              />
            )}
          </div>
        </div>
        <div>
          <div>状态：{info.status ? "在售" : "已售"}</div>
          <div className="mt-2">入库时间：{formatTime(info.inputTime)}</div>
        </div>
      </section>

      <section className="h-[60vh] px-2 overflow-y-auto">
        <div className="flex items-center justify-between">
          <span>封面图片</span>
          {editType && (
            <label className="btn w-40 btn-accent not-dark:hover:text-white dark:text-white not-dark:btn-soft">
              更换封面图片
              <input
                type="file"
                name="cover"
                id="cover"
                hidden
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    coverChangeHandle?.(file);
                    setCoverSrc(
                      URL.createObjectURL
                        ? URL.createObjectURL(file)
                        : window.webkitURL.createObjectURL(file)
                    );
                  }
                }}
              />
            </label>
          )}
        </div>

        <div className="mt-4 mx-auto w-40 h-60 xl:w-40 xl:h-56 rounded-lg overflow-hidden">
          <img
            src={coverSrc}
            alt="book cover"
            className="object-cover h-full mx-auto"
          />
        </div>

        <div className="mt-6 justify-between items-center flex">
          <span>详情图片</span>
          {editType && (
            <label
              htmlFor="imgSrcList"
              className="btn w-40 btn-accent not-dark:hover:text-white dark:text-white not-dark:btn-soft"
            >
              添加图片
              <input
                type="file"
                name="imgSrcList"
                id="imgSrcList"
                hidden
                accept="image/*"
                multiple
                onChange={(e) => {
                  const files = e.target.files;
                  if (files) {
                    setImgSrcList((prev) => {
                      const newFileList = [
                        ...prev,
                        ...Array.from(files).filter((file) =>
                          file.type.startsWith("image")
                        ),
                      ];
                      imgChangeHandle?.(newFileList);
                      return newFileList;
                    });
                  }
                }}
              />
            </label>
          )}
        </div>

        <div
          className={
            "mt-6 w-96 overflow-y-auto grid " +
            (imgSrcList.length > 0 ? "h-60 grid-cols-2" : "")
          }
        >
          {imgSrcList.length > 0 ? (
            imgSrcList.map((src_, index) => {
              let src;
              if (src_ instanceof File) {
                src = URL.createObjectURL
                  ? URL.createObjectURL(src_)
                  : window.webkitURL.createObjectURL(src_);
              } else {
                src = import.meta.env.VITE_SERVER_URL + src_;
              }

              return (
                <div
                  className="group w-40 h-60 relative mx-auto rounded-lg overflow-hidden"
                  id={src}
                  key={src}
                >
                  <img
                    src={src}
                    alt="cover"
                    className="object-cover h-full w-full"
                  />
                  {editType && (
                    <div className="hidden group-hover:flex flex-col gap-6 justify-center items-center absolute top-0 right-0 w-full h-full bg-black/50">
                      <button
                        type="button"
                        className="btn btn-success not-dark:btn-soft not-dark:hover:text-white dark:text-white"
                        onClick={() => {
                          setImgSrcList((prev) => {
                            if (index === 0) return prev;
                            const newFileList = [
                              ...prev.splice(index, 1),
                              ...prev,
                            ];
                            imgChangeHandle?.(newFileList);
                            return newFileList;
                          });
                        }}
                      >
                        移到最前
                      </button>
                      <button
                        type="button"
                        className="btn btn-error not-dark:btn-soft not-dark:hover:text-white dark:text-white"
                        onClick={() => {
                          setImgSrcList((prev) => {
                            prev.splice(index, 1);
                            imgChangeHandle?.(prev);
                            return [...prev];
                          });
                        }}
                      >
                        删除
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <p className="my-6 text-gray-500 text-center">暂无</p>
          )}
        </div>
      </section>
    </div>
  );
}

const categoryList = {
  "0": "文学小说",
  "1": "历史社科",
  "2": "学习教育",
  "3": "科技科普",
  "4": "艺术生活",
  "5": "课程相关",
  "6": "其它",
};
