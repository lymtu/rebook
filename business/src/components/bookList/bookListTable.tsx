import type { Book } from "@/lib/types/book";

import { useAuthContext } from "@/lib/context/auth/authContext";
import { formatTime } from "@/lib/utils/TimeFormatConverter";
import { useState } from "react";

import TableTemplate from "@/components/tableTemplate";
import View from "@/components/bookList/viewBox";
import Edit from "@/components/bookList/editForm";
import Delete from "@/components/bookList/deleteForm";

export default function BookListTable({
  bookList,
}: {
  bookList: Book[] | undefined;
}) {
  return (
    <div className="overflow-x-auto">
      <TableTemplate
        theadList={[
          "序列号",
          "编号",
          "书名",
          "价格",
          "状态",
          "入库时间",
          "操作",
        ]}
      >
        {bookList?.map((item, index) => (
          <tr
            key={item.id}
            className="*:py-2 hover:bg-gray-200 odd:bg-gray-50 dark:hover:bg-gray-600 dark:odd:bg-gray-950 transition-colors duration-150"
          >
            <td>{index + 1}</td>
            <td title={item.id} className="w-1/12 truncate">
              {item.id}
            </td>
            <td className="w-1/4 truncate">{item.name}</td>
            <td className="w-1/12">{item.price}</td>
            <td className="w-1/12">{item.status ? "在售" : "下架"}</td>
            <td className="w-1/12 truncate">{formatTime(item.inputTime)}</td>
            <ButtonList id={item.id} isSold={!item.status} name={item.name} />
          </tr>
        ))}
      </TableTemplate>
    </div>
  );
}

function ButtonList({
  id,
  isSold,
  name,
}: {
  id: Book["id"];
  isSold: boolean;
  name: Book["name"];
}) {
  const { info: authInfo } = useAuthContext();
  const [isShowObj, setIsShowObj] = useState<{
    view: boolean;
    edit: boolean;
    delete: boolean;
  }>({
    view: false,
    edit: false,
    delete: false,
  });

  return (
    <td className="flex gap-2 items-center justify-center">
      {authInfo.root.includes("admin:view") && (
        <>
          <button
            className="btn not-dark:btn-soft btn-sm btn-accent not-dark:hover:text-white dark:text-white"
            onClick={() => {
              setIsShowObj({
                view: true,
                edit: false,
                delete: false,
              });
            }}
          >
            查看
          </button>
          {isShowObj.view && (
            <View
              id={id}
              closeWindowHandler={() => {
                setIsShowObj((prev) => ({ ...prev, view: false }));
              }}
            />
          )}
        </>
      )}
      {authInfo.root.includes("admin:edit") && (
        <>
          <button
            className="btn not-dark:btn-soft dark:text-gray-200 btn-sm btn-primary"
            onClick={() => {
              setIsShowObj({
                view: false,
                edit: true,
                delete: false,
              });
            }}
          >
            编辑
          </button>
          {isShowObj.edit && (
            <Edit
              id={id}
              closeWindowHandler={() => {
                setIsShowObj((prev) => ({ ...prev, edit: false }));
              }}
            />
          )}
        </>
      )}
      {!isSold && authInfo.root.includes("admin:delete") && (
        <>
          <button
            className="btn not-dark:btn-soft dark:text-gray-200 btn-sm btn-secondary"
            onClick={() => {
              setIsShowObj({
                view: false,
                edit: false,
                delete: true,
              });
            }}
          >
            删除
          </button>
          {isShowObj.delete && (
            <Delete
              id={id}
              name={name}
              closeWindowHandler={() => {
                setIsShowObj((prev) => ({ ...prev, delete: false }));
              }}
            />
          )}
        </>
      )}
    </td>
  );
}
