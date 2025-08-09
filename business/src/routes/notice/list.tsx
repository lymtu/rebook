import type { Notice } from "@/lib/types/notice";
import { useEffect, useState } from "react";
import { useResponseHandle, useErrorHandle } from "@/lib/utils/responseHandle";
import { useNavigate, useSearchParams } from "react-router";
import { useAlertContext } from "@/lib/context/alert/alertContext";
import PageNumberRedirect from "@/components/pageNumberRedirect";
import NoticeListTable from "@/components/notice/noticeListTable";

type NoticeListInfo = {
  data: Notice[];
  totalDocuments: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
};

export default function NoticeList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const page = searchParams.get("page") || "1";
  const { addAlert } = useAlertContext();
  const [noticeListInfo, setNoticeListInfo] = useState<NoticeListInfo | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const errorHandle = useErrorHandle();
  const responseHandle = useResponseHandle();

  useEffect(() => {
    if (isNaN(Number(page))) {
      addAlert({
        type: "error",
        message: "参数错误",
        id: Date.now(),
      });
      return;
    }

    setIsLoading(true);
    getNoticeList(page)
      .then(responseHandle)
      .then((data) => {
        setNoticeListInfo(data as NoticeListInfo);
        setIsLoading(false);
      })
      .catch(errorHandle);
  }, [page, responseHandle, errorHandle, addAlert]);

  return (
    <div>
      <div className="mb-6 ml-auto w-fit">
        <PageNumberRedirect
          page={page}
          totalPages={noticeListInfo?.totalPages || 0}
          pageRedirectHandle={(targetPage) => {
            navigate(`/notice-list?page=${targetPage}`);
          }}
          pageNumberOutOfRangeHandle={() => {
            addAlert({
              type: "error",
              message: "页码超出范围",
              id: Date.now(),
            });
          }}
        />
      </div>

      <div>
        {isLoading ? (
          <span className="loading loading-spinner"></span>
        ) : (
          <NoticeListTable noticeList={noticeListInfo?.data} />
        )}
      </div>
    </div>
  );
}

const getNoticeList = async (page: string) => {
  const res = await fetch(
    import.meta.env.VITE_SERVER_URL + "/notices?pageSize=10&page=" + page,
    {
      credentials: "include",
    }
  );
  const data = await res.json();
  return data;
};
