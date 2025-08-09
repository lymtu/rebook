import { getRouteApi } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { Book } from "@/lib/types/book";

const routeApi = getRouteApi("/books");

export function BookList({ className }: { className?: string }) {
  const { page, category } = routeApi.useSearch();
  const [isLoading, setLoading] = useState(true);
  const [data, setData] = useState<{
    data: Book[];
    totalDocuments: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  }>({
    data: [],
    totalDocuments: 0,
    totalPages: 0,
    currentPage: 0,
    pageSize: 0,
  });

  useEffect(() => {
    setLoading(true);
    fetch(
      import.meta.env.VITE_SERVER_URL +
        "/books?page=" +
        (page ?? 1) +
        "&category=" +
        category
    )
      .then((res) => res.json())
      .then((res) => {
        if (res.code === 200) {
          setData(res.data);
        }
        setLoading(false);
      });
  }, [page, category]);

  if (isLoading) {
    return (
      <div className={"flex justify-center items-center h-full " + className}>
        Loading...
      </div>
    );
  }

  return (
    <div className={"w-full h-full overflow-y-auto no-scrollBar " + className}>
      {data.data.length === 0 ? (
        <div className="flex justify-center items-center h-full">
          <div className="text-xl">没有数据</div>
        </div>
      ) : (
        <div>
          {data.data.map((item) => (
            <BookItem key={item.id} {...item} />
          ))}
        </div>
      )}
    </div>
  );
}

function BookItem({ id, name, author, coverSrc, category }: Book) {
  return (
    <div className="aspect-[3/4] w-[300px]">
      <img src={import.meta.env.VITE_SERVER_URL + coverSrc} alt="cover" />
      
    </div>
  );
}
