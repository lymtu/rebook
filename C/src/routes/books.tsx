import { createFileRoute, Link } from "@tanstack/react-router";
import { BookList } from "@/components/books/bookList";
import fadeInStyle from "@/assets/fadeIn.module.css";

export const Route = createFileRoute("/books")({
  component: RouteComponent,
  validateSearch: (search) => {
    if (search.category) {
      if (isNaN(Number(search.category))) {
        throw new Error("category must be number");
      }
      if (Number(search.category) < 0 || Number(search.category) > 6) {
        throw new Error("category must be in range 0-6");
      }
    }
    return search;
  },
});

function RouteComponent() {
  return (
    <div className="h-full w-[300px] md:w-[600px] lg:w-[900px] xl:w-[1000px] 2xl:w-[1500px] mx-auto flex gap-10 justify-between text-black/70">
      <Aside className="hidden lg:block" />
      <BookList className="w-[300px] md:w-[600px] lg:w-[500px] xl:w-[800px] 2xl:w-[1000px] mx-auto" />
    </div>
  );
}

const categoryList = [
  { value: 0, content: "文学小说" },
  { value: 1, content: "历史社科" },
  { value: 2, content: "学习教育" },
  { value: 3, content: "科技科普" },
  { value: 4, content: "艺术生活" },
  { value: 5, content: "课程相关" },
  { value: 6, content: "其他" },
];

function Aside({ className }: { className?: string }) {
  const { category } = Route.useSearch() as { category?: string };
  return (
    <aside
      className="w-fit h-full relative"
      style={{ "--transform-x": "-100px" } as any}
    >
      <div
        className={
          "translate-y-[100px] " + className + " " + fadeInStyle["fade-in"]
        }
      >
        <span className="flex items-center gap-2">
          <svg
            className="*:stroke-current"
            width="24"
            height="24"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18 4H6C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V6C20 4.89543 19.1046 4 18 4Z"
              fill="none"
              stroke="#000000"
              strokeWidth="4"
              strokeLinejoin="round"
            />
            <path
              d="M18 28H6C4.89543 28 4 28.8954 4 30V42C4 43.1046 4.89543 44 6 44H18C19.1046 44 20 43.1046 20 42V30C20 28.8954 19.1046 28 18 28Z"
              fill="none"
              stroke="#000000"
              strokeWidth="4"
              strokeLinejoin="round"
            />
            <path
              d="M42 4H30C28.8954 4 28 4.89543 28 6V18C28 19.1046 28.8954 20 30 20H42C43.1046 20 44 19.1046 44 18V6C44 4.89543 43.1046 4 42 4Z"
              fill="none"
              stroke="#000000"
              strokeWidth="4"
              strokeLinejoin="round"
            />
            <path
              d="M28 28H44"
              stroke="#000000"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M36 36H44"
              stroke="#000000"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M28 44H44"
              stroke="#000000"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <h3 className="text-2xl font-bold">全部分类</h3>
        </span>
        <ul className="space-y-4 py-4">
          {categoryList.map((item) => (
            <li key={item.value}>
              <Link
                to="."
                search={(pre) => ({ ...pre, category: item.value })}
                className={
                  "flex items-center gap-4 md:gap-0 md:justify-between px-4 py-2 rounded-full hover:text-white md:w-[200px] hover:bg-black/50 duration-150 " +
                  (Number(category) === item.value
                    ? "bg-black/50 text-white"
                    : "group")
                }
              >
                <span className="">{item.content}</span>

                <svg
                  className={
                    "*:stroke-current " +
                    (Number(category) === item.value
                      ? ""
                      : "hidden group-hover:block")
                  }
                  width="16"
                  height="16"
                  viewBox="0 0 48 48"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M19 12L31 24L19 36"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
