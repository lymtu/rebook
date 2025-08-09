import { useThemeContext } from "@/lib/context/themeState/ThemeContext";

export default function TableTemplate({
  theadList,
  children,
}: {
  theadList: string[];
  children: React.ReactNode;
}) {
  const { theme } = useThemeContext();
  return (
    <table data-theme={theme} className="table text-center duration-150">
      <thead className="text-center bg-gray-200 dark:bg-gray-800 transition-colors">
        <tr>
          {theadList.map((item, index) => (
            <th key={index}>{item}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {(children as React.ReactElement[])?.length > 0 ? (
          <>{children}</>
        ) : (
          <tr>
            <th
              colSpan={theadList.length}
              className="text-gray-500 dark:text-gray-400"
            >
              暂无数据
            </th>
          </tr>
        )}
      </tbody>
    </table>
  );
}
