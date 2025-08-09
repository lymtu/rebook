import type { Bill } from "@/lib/types/bill";

import PageNumberRedirect from "@/components/pageNumberRedirect";
import BillListTable from "@/components/bill/billListTable";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useAlertContext } from "@/lib/context/alert/alertContext";
import { useErrorHandle, useResponseHandle } from "@/lib/utils/responseHandle";

type BillListInfo = {
  totalPages: number;
  data: Bill[];
  currentPage: number;
  pageSize: number;
  totalDocuments: number;
};

export default function Bill() {
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const page = searchParams.get("page") || "1";
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { addAlert } = useAlertContext();
  const [billListInfo, setBillListInfo] = useState<BillListInfo | null>(null);

  const responseHandle = useResponseHandle();
  const errorHandle = useErrorHandle();

  useEffect(() => {
    if (isNaN(Number(page))) {
      addAlert({
        type: "error",
        message: "参数错误",
        id: Date.now(),
      });
      nav("/bill-list");
      return;
    }

    fetch(import.meta.env.VITE_SERVER_URL + "/admin/bills", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then(responseHandle)
      .then((data) => {
        setBillListInfo(data as BillListInfo);
        setIsLoading(false);
      })
      .catch(errorHandle);
  }, [addAlert, nav, page, errorHandle, responseHandle]);

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="ml-auto">
        <PageNumberRedirect
          page={page}
          totalPages={billListInfo?.totalPages || 1}
          pageRedirectHandle={(targetPage) => {
            if (targetPage === +page) return;
            nav(`/bill-list?page=${targetPage}`);
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
      {isLoading ? (
        <div className="text-center">加载中...</div>
      ) : (
        <BillListTable />
      )}
    </div>
  );
}
