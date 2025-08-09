import type { Notice } from "@/lib/types/notice";

import { useAuthContext } from "@/lib/context/auth/authContext";
import { formatTime } from "@/lib/utils/TimeFormatConverter";
import { useState } from "react";
import { GreenBtn, RedBtn } from "@/components/button";

import TableTemplate from "@/components/tableTemplate";
import View from "./viewBox";
import Edit from "./editForm";
import Delete from "./deleteForm";

export default function NoticeListTable({
  noticeList,
}: {
  noticeList: Notice[] | undefined;
}) {
  return (
    <div className="overflow-x-auto">
      <TableTemplate
        theadList={[
          "序列号",
          "编号",
          "标题",
          "发布时间",
          "最后更改时间",
          "操作",
        ]}
      >
        {noticeList && noticeList.length > 0
          ? noticeList.map((item, index) => (
              <tr key={item.id}>
                <th>{index + 1}</th>
                <td>{item.id}</td>
                <td>{item.title}</td>
                <td>{formatTime(item.time)}</td>
                <td>
                  {item.changeTime
                    ? formatTime(item.changeTime)
                    : formatTime(item.time)}
                </td>
                <ButtonList id={item.id} title={item.title} />
              </tr>
            ))
          : null}
      </TableTemplate>
    </div>
  );
}

function ButtonList({
  id,
  title,
}: {
  id: Notice["id"];
  title: Notice["title"];
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
          <GreenBtn
            onClick={() => {
              setIsShowObj({
                view: true,
                edit: false,
                delete: false,
              });
            }}
          >
            查看
          </GreenBtn>
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
      {authInfo.root.includes("admin:delete") && (
        <>
          <RedBtn
            onClick={() => {
              setIsShowObj({
                view: false,
                edit: false,
                delete: true,
              });
            }}
          >
            删除
          </RedBtn>
          {isShowObj.delete && (
            <Delete
              id={id}
              title={title}
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
