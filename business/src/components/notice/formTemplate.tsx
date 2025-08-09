import { useState } from "react";
import Markdown from "@/components/notice/markdown";

export default function FormTemplate({
  editType = true,
  submitHandle,
  title: titleProp,
  content: contentProp,
  children,
}: {
  editType?: boolean;
  submitHandle?: ({
    title,
    content,
  }: {
    title: string;
    content: string;
  }) => Promise<boolean | void>;
  title?: string;
  content?: string;
  children?: React.ReactNode;
}) {
  const [title, setTitle] = useState(titleProp || "");
  const [content, setContent] = useState(contentProp || "");

  return (
    <div className="tabs tabs-lift h-full mx-auto md:w-[600px] lg:w-[800px] xl:w-[800px] 2xl:w-[800px]">
      <input
        type="radio"
        name="my_tabs"
        className="tab dark:not-checked:bg-gray-900! dark:checked:bg-gray-800! dark:border-none! dark:after:text-white dark:before:bg-[url('')]!"
        aria-label="编写"
        defaultChecked
      />
      <div className="tab-content bg-base-100 border-base-300 p-6 dark:bg-gray-800 dark:border-gray-900">
        <form
          action=""
          className="flex flex-col gap-6 h-full min-h-[50vh]"
          onSubmit={async (e) => {
            e.preventDefault();
            const isClear = await submitHandle?.({
              title,
              content,
            });

            if (isClear) {
              setTitle("");
              setContent("");
            }
          }}
        >
          <label htmlFor="title">标题</label>
          <input
            type="text"
            readOnly={!editType}
            className="input w-full dark:bg-gray-700 dark:focus:border-white"
            id="title"
            value={title}
            maxLength={20}
            onChange={(e) => setTitle(e.target.value)}
          />
          <label htmlFor="content">内容</label>
          <textarea
            id="content"
            readOnly={!editType}
            className="textarea w-full flex-1 resize-none h-[200px] dark:bg-gray-700 dark:focus:border-white dark:before:bg-gray-800!"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          {editType && children}
        </form>
      </div>

      <input
        type="radio"
        name="my_tabs"
        className="tab dark:not-checked:bg-gray-900! dark:checked:bg-gray-800! dark:border-none! dark:after:text-white dark:before:bg-[url('')]!"
        aria-label="预览"
      />
      <div className="tab-content bg-base-100 border-base-300 p-6 dark:bg-gray-800 dark:border-gray-900">
        <div className="min-h-[50vh] flex flex-col gap-2">
          <div className="h-[30px]">
            <h2 className="text-2xl font-bold truncate">{title}</h2>
          </div>
          <div className="border-t wrap-anywhere h-full overflow-y-auto">
            <Markdown>{content}</Markdown>
          </div>
        </div>
      </div>
    </div>
  );
}
