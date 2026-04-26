import { Typography } from 'antd';
import { Link } from 'react-router-dom';
import { BOOK_CONDITION_LABEL } from '@rebook/shared';
import type { BookDTO } from '@rebook/shared';
import { publicAssetUrl } from '@/features/book/public-url';

const { Text } = Typography;

function formatPrice(cents: number) {
  return `¥${(cents / 100).toFixed(2)}`;
}

/** 书卡：在稿面结构上略提高封面比例与层次，避免扁、糊、挤 */
export function BookCard({ book }: { book: BookDTO }) {
  const src = publicAssetUrl(book.coverImageKey);

  return (
    <Link
      to={`/books/${book.id}`}
      className="group block h-full rounded-xl border border-[#E5E0D6] bg-white p-3 shadow-[0_1px_2px_rgba(30,51,34,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#D4CEC2] hover:shadow-[0_8px_24px_rgba(30,51,34,0.08)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2D6B3F]/50"
    >
      <div className="relative mb-3 overflow-hidden rounded-lg bg-gradient-to-b from-[#EEEBE3] to-[#D4CFC2]/80 aspect-[3/4] max-h-[220px]">
        {src ? (
          <img src={src} alt="" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]" />
        ) : (
          <div className="flex h-full min-h-[140px] items-center justify-center px-2 text-center text-[12px] text-[#6B7B6B]">
            暂无封面
          </div>
        )}
      </div>
      <div className="text-[13px] font-semibold leading-snug text-[#1E3322] line-clamp-2 min-h-[2.5rem] tracking-tight">
        {book.title}
      </div>
      <div className="mt-2 font-display text-[17px] font-semibold tabular-nums text-[#2D6B3F]">{formatPrice(book.priceCents)}</div>
      <Text className="!mt-1 !block !text-[11px] !leading-tight !text-[#6B7B6B]">{BOOK_CONDITION_LABEL[book.conditionGrade]}</Text>
    </Link>
  );
}
