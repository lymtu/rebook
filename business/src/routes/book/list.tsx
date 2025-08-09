import { useAlertContext } from "@/lib/context/alert/alertContext";
import { useCallback, useEffect, useState } from "react";
import type { Book } from "@/lib/types/book";
import { useNavigate, useSearchParams } from "react-router";
import BookListTable from "@/components/bookList/bookListTable";
import PageNumberRedirect from "@/components/pageNumberRedirect";
import { useErrorHandle, useResponseHandle } from "@/lib/utils/responseHandle";

type BookListInfo = {
  data: Book[];
  totalDocuments: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
};

export default function BookList() {
  const [searchParams] = useSearchParams();
  const page = searchParams.get("page") || "1";
  const [isLoading, setLoading] = useState(true);
  const [bookListInfo, setBookListInfo] = useState<BookListInfo | null>(null);
  const { addAlert } = useAlertContext();
  const navigate = useNavigate();

  const errorHandle = useErrorHandle();
  const responseHandle = useResponseHandle();

  const bookListInfoHandle = useCallback(
    (page: number) => {
      setLoading(true);
      getBookListInfo(page)
        .then(responseHandle)
        .then((data) => {
          setLoading(false);
          setBookListInfo(
            data as {
              data: Book[];
              totalDocuments: number;
              totalPages: number;
              currentPage: number;
              pageSize: number;
            }
          );
        })
        .catch(errorHandle);
    },
    [errorHandle, responseHandle]
  );

  useEffect(() => {
    if (isNaN(Number(page))) {
      addAlert({
        type: "error",
        message: "参数错误",
        id: Date.now(),
      });
      return;
    }
    bookListInfoHandle(Number(page));
  }, [page, bookListInfoHandle, addAlert]);

  return (
    <>
      <div className="mb-6 flex justify-between items-center px-6">
        <div>
          共{" "}
          <span className="font-bold">{bookListInfo?.totalDocuments || 0}</span>{" "}
          本图书
        </div>
        <PageNumberRedirect
          page={page}
          totalPages={bookListInfo?.totalPages || 0}
          pageRedirectHandle={(targetPage) => {
            navigate(`/book-list?page=${targetPage}`);
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
        <div className="flex justify-center items-center h-full">
          <span className="loading loading-spinner loading-xl"></span>
        </div>
      ) : (
        <BookListTable bookList={bookListInfo?.data} />
      )}
    </>
  );
}

async function getBookListInfo(page: number = 1) {
  return await fetch(
    import.meta.env.VITE_SERVER_URL + "/admin/books?page=" + page,
    {
      credentials: "include",
    }
  ).then((res) => res.json());
}
