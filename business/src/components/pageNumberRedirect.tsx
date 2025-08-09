export default function PageNumberRedirect({
  page,
  totalPages,
  pageRedirectHandle,
  pageNumberOutOfRangeHandle,
}: {
  page: string;
  totalPages: number;
  pageRedirectHandle: (targetPage: number) => void;
  pageNumberOutOfRangeHandle: () => void;
}) {
  return (
    <div className="flex items-center">
      <div className="join dark:*:bg-gray-900 dark:*:text-white dark:*:border-gray-900 dark:*:hover:bg-gray-700 dark:*:hover:border-gray-700">
        <button
          className="join-item btn"
          onClick={() => {
            if (isNaN(Number(page)) || totalPages === 0) return;
            const targetPage = Number(page) - 1 <= 0 ? 1 : Number(page) - 1;
            pageRedirectHandle(targetPage);
          }}
        >
          «
        </button>
        <button className="join-item btn">
          第{totalPages === 0 ? 0 : Number(page)}页 / 共{totalPages}页
        </button>
        <button
          className="join-item btn"
          onClick={() => {
            if (isNaN(Number(page)) || totalPages === 0) return;
            const targetPage =
              Number(page) + 1 > totalPages ? totalPages : Number(page) + 1;
            pageRedirectHandle(targetPage);
          }}
        >
          »
        </button>
      </div>

      <div className="ml-4">
        <form
          action=""
          className="flex items-center dark:*:bg-gray-900 dark:*:text-white dark:*:border-gray-900 dark:*:hover:bg-gray-700 dark:*:hover:border-gray-700"
          onSubmit={(e) => {
            e.preventDefault();
            const input = (e.target as HTMLFormElement)[0] as HTMLInputElement;

            if (+input.value > totalPages) {
              pageNumberOutOfRangeHandle();
              return;
            }

            pageRedirectHandle(Number(input.value));
          }}
        >
          <input
            type="number"
            className="input duration-150 w-20 text-center"
            name=""
            id=""
            min="1"
          />
          <button className="btn">跳转</button>
        </form>
      </div>
    </div>
  );
}
