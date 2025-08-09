import { NavLink, useLocation } from "react-router";
import { Bookshelf, Order, Announcement } from "@icon-park/react";

type CompositeRoute = {
  name: string;
  icon: JSX.Element;
  list: {
    path: string;
    name: string;
  }[];
};

type SingleRoute = {
  path: string;
  name: string;
  icon: JSX.Element;
};

const routes: (CompositeRoute | SingleRoute)[] = [
  {
    name: "书籍管理",
    icon: (
      <Bookshelf
        className="*:**:stroke-current"
        theme="outline"
        size="24"
        fill="#000000"
      />
    ),
    list: [
      {
        path: "/book-list",
        name: "全部书籍",
      },
      {
        path: "/book-add",
        name: "添加书籍",
      },
    ],
  },
  {
    path: "/bill-list",
    name: "订单管理",
    icon: (
      <Order
        className="*:**:stroke-current"
        theme="outline"
        size="24"
        fill="#000000"
      />
    ),
  },
  {
    name: "公告管理",
    icon: (
      <Announcement
        className="*:**:stroke-current"
        theme="outline"
        size="24"
        fill="#000000"
      />
    ),
    list: [
      {
        path: "/notice-list",
        name: "全部公告",
      },
      {
        path: "/notice-add",
        name: "添加公告",
      },
    ],
  },
];

function RouteAside() {
  return (
    <>
      <h2 className="text-2xl font-bold my-4 text-center">导航</h2>
      <div className="flex flex-col gap-2 mt-4">
        {routes.map((item: CompositeRoute | SingleRoute) => {
          if ("list" in item) {
            return (
              <Dropdown
                key={item.name}
                icon={item.icon}
                name={item.name}
                list={item.list}
              />
            );
          }

          return (
            <div
              key={item.name}
              className="p-4 rounded-lg flex items-center bg-base-100 dark:bg-gray-800 font-bold transition-[background-color] duration-200"
            >
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  (isActive
                    ? "bg-gray-100 dark:bg-gray-700 duration-150"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700") +
                  " flex-1 flex items-center gap-2 p-2 rounded-md font-bold"
                }
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            </div>
          );
        })}
      </div>
    </>
  );
}

function Dropdown({ icon, name, list }: CompositeRoute) {
  const location = useLocation();
  const isMatch = list.some((route) => route.path === location.pathname);
  return (
    <div
      className="collapse collapse-arrow bg-base-100 border border-base-300 dark:bg-gray-800 dark:border-black"
      style={{
        transition:
          "background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, grid-template-rows 0.2s ease-in-out",
      }}
    >
      <input type="radio" name="my-accordion-2" defaultChecked={isMatch} />
      <div className="collapse-title font-semibold flex items-center gap-2">
        {icon}
        <span>{name}</span>
      </div>
      <div className="collapse-content text-sm">
        {list.map((route) => (
          <NavLink
            to={route.path}
            key={route.path}
            className={({ isActive }: { isActive: boolean }) =>
              (isActive
                ? "bg-gray-100 dark:bg-gray-700"
                : "hover:bg-gray-100 dark:hover:bg-gray-700") +
              " p-2 rounded-md block font-bold not-last:mb-2 transition-[background-color] duration-200"
            }
          >
            {route.name}
          </NavLink>
        ))}
      </div>
    </div>
  );
}

export default RouteAside;
