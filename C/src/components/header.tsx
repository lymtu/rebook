import { useCallback, useState } from "react";
import { useUserContext } from "@/lib/context/userContext/context";
import { Link } from "@tanstack/react-router";

function Header() {
  const [value, setValue] = useState<string>("");
  const { info, setInfo } = useUserContext();
  const submitHandler = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  }, []);

  return (
    <header className="flex items-center justify-between text-white border-b border-gray-200 py-4 px-6">
      <Link to="/" className="flex">
        <h4 className="ml-2 text-xl font-bold">Rebook</h4>
        <span className="hidden lg:inline text-sm ml-2">校园二手书平台</span>
      </Link>

      <form
        action=""
        onSubmit={submitHandler}
        className="bg-white/50 has-[input:focus]:bg-white/80 duration-150 backdrop-blur-xl rounded-full flex items-center px-2"
      >
        <span>
          <svg
            className="*:stroke-gray-400"
            width="16"
            height="16"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M21 38C30.3888 38 38 30.3888 38 21C38 11.6112 30.3888 4 21 4C11.6112 4 4 11.6112 4 21C4 30.3888 11.6112 38 21 38Z"
              fill="none"
              strokeWidth="4"
              strokeLinejoin="round"
            />
            <path
              d="M26.657 14.3431C25.2093 12.8954 23.2093 12 21.0001 12C18.791 12 16.791 12.8954 15.3433 14.3431"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M33.2216 33.2217L41.7069 41.707"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <input
          type="text"
          name="search"
          id="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="text-black bg-transparent outline-none ml-2 py-0.5"
        />
      </form>

      <div>{info ? <div></div> : <Link to="/signin">登录</Link>}</div>
    </header>
  );
}

export default Header;
