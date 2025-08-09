import { useEffect, useState } from "react";
import { Card } from "@/components/3dCard";
import { Link } from "@tanstack/react-router";

export function Cards() {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    fetch(import.meta.env.VITE_SERVER_URL + "/recommend")
      .then((res) => res.json())
      .then((res) => {
        if (res.code === 200) {
          setBooks(res.data.data);
        }
      });
  }, []);

  return (
    <div>
      {books.length > 0 && (
        <>
          <h3 className="text-2xl font-bold">热门推荐</h3>
          <div className="flex gap-6 mt-6">
            {books.map((item: any) => (
              <Card key={item.id}>
                <div className="w-full h-2/3">
                  <img
                    className="w-full h-full object-cover"
                    src={import.meta.env.VITE_SERVER_URL + item.coverSrc}
                    alt=""
                  />
                </div>
                <div className="h-1/3 px-2 group">
                  <div className="max-w-full text-sm 2xl:text-base truncate">
                    {item.name}
                  </div>
                  <div className="mt-2">
                    <Link
                      to={"/books/" + item.id}
                      className="hidden group-hover:block float-start text-sm 2xl:text-base rounded-xl text-center px-2 py-1 text-white hover:bg-amber-500 bg-[#EF7424] duration-150"
                    >
                      查看详情
                    </Link>
                    <div className="group-hover: text-end text-sm 2xl:text-base text-[#EF7424]">
                      ￥<span className="text-xl">{item.price}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
