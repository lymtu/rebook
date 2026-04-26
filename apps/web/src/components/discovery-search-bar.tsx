import { SearchOutlined } from '@ant-design/icons';

/** 搜索行：稿面色值 + 更易用的聚焦态与过渡 */
export function DiscoverySearchBar({
  value,
  onChange,
  onSearch,
  className = '',
}: {
  value: string;
  onChange: (v: string) => void;
  onSearch: (v: string) => void;
  className?: string;
}) {
  return (
    <div
      className={`flex h-[46px] items-center gap-2.5 rounded-lg border border-[#D4CEC2] bg-[#F3F0E8] px-4 shadow-[inset_0_1px_2px_rgba(30,51,34,0.04)] transition-[box-shadow,border-color] duration-200 focus-within:border-[#2D6B3F]/35 focus-within:shadow-[inset_0_1px_2px_rgba(30,51,34,0.04),0_0_0_3px_rgba(45,107,63,0.12)] ${className}`}
    >
      <SearchOutlined className="shrink-0 text-[18px] text-[#6B7B6B] opacity-90" aria-hidden />
      <input
        type="search"
        enterKeyHint="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onSearch((e.target as HTMLInputElement).value);
        }}
        placeholder="搜索书名、作者、ISBN"
        className="min-w-0 flex-1 border-0 bg-transparent p-0 text-[15px] text-[#1E3322] outline-none placeholder:text-[#8A9190]"
        autoComplete="off"
      />
    </div>
  );
}
