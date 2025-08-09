import { Link, createFileRoute } from "@tanstack/react-router";

import fadeInStyle from "@/assets/fadeIn.module.css";
import { Cards } from "@/components/index/cards";
import { NotesBox } from "@/components/index/notesBox";

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  return (
    <div className="relative h-full flex items-center justify-center text-black/70">
      <aside
        style={{ "--transform-x": "-100px" } as any}
        className={
          "absolute top-[100px] left-[100px] " + fadeInStyle["fade-in"]
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
          <h3 className="text-2xl font-bold">推荐分类</h3>
        </span>
        <ul className="space-y-4 py-4">
          {asideRouter.map((item) => (
            <li key={item.content}>
              <Link
                to="/books"
                search={item.search}
                className="group flex items-center gap-4 md:gap-0 md:justify-between px-4 py-2 rounded-full hover:text-white md:w-[200px] hover:bg-black/50 duration-150"
              >
                <span className="">{item.content}</span>

                <svg
                  className="*:stroke-current hidden group-hover:block"
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

          <li>
            <Link
              to="/books"
              className="group flex items-center gap-4 md:gap-0 md:justify-between px-4 py-2 rounded-full hover:text-white md:w-[200px] hover:bg-black/50 duration-150"
            >
              <span className="">更多</span>

              <svg
                className="*:stroke-current hidden group-hover:block"
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
        </ul>
      </aside>

      <div className="flex-1"></div>

      <div
        style={{ "--transform-x": "100px" } as any}
        className={
          "absolute top-1/2 right-10 space-y-10 -translate-y-1/2 " +
          fadeInStyle["fade-in"]
        }
      >
        <NotesBox />
        <Cards />
      </div>
    </div>
  );
}

const asideRouter = [
  {
    search: { category: 0 },
    content: "文学小说",
  },
  {
    search: { category: 1 },
    content: "历史社科",
  },
  {
    search: { category: 2 },
    content: "学习教育",
  },
];
