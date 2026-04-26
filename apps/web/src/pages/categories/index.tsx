import { Col, Row, Spin, Typography } from 'antd';
import { Link, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useBooksInfinite } from '@/features/book/api';
import { BookCard } from '@/components/book-card';
import { DiscoverySearchBar } from '@/components/discovery-search-bar';

const { Title, Text } = Typography;

const SIDES = [
  { key: 'all', label: '全部', q: '' },
  { key: 'jiaocai', label: '教材 / 教辅', q: '教材' },
  { key: 'tongshi', label: '通识', q: '通识' },
  { key: 'wenxue', label: '文学', q: '文学' },
];

function isSideKey(v: string | null): v is (typeof SIDES)[number]['key'] {
  return v != null && SIDES.some((s) => s.key === v);
}

function categoriesHref(sideKey: (typeof SIDES)[number]['key'], qCommitted: string): string {
  const sp = new URLSearchParams();
  if (sideKey !== 'all') sp.set('s', sideKey);
  const t = qCommitted.trim();
  if (t) sp.set('q', t);
  const qs = sp.toString();
  return qs ? `/categories?${qs}` : '/categories';
}

/** 【用户】10 分类浏览 — rebook.pen W10（顶栏下搜索行 + 侧栏分类 + 列表） */
export function Component() {
  const [params, setSearchParams] = useSearchParams();
  const [active, setActive] = useState<(typeof SIDES)[number]['key']>('all');
  const qCommitted = params.get('q') ?? '';
  const [searchDraft, setSearchDraft] = useState(qCommitted);

  useEffect(() => {
    const s = params.get('s');
    if (isSideKey(s)) setActive(s);
    else setActive('all');
  }, [params]);

  useEffect(() => {
    setSearchDraft(qCommitted);
  }, [qCommitted]);

  const categoryQ = SIDES.find((s) => s.key === active)?.q ?? '';
  const apiQ = qCommitted.trim() || categoryQ;
  const { data, isLoading } = useBooksInfinite(apiQ);

  const items = data?.pages.flatMap((p) => p.items) ?? [];

  const commitSearch = (raw: string) => {
    const sp = new URLSearchParams();
    if (active !== 'all') sp.set('s', active);
    const t = raw.trim();
    if (t) sp.set('q', t);
    setSearchParams(sp);
  };

  return (
    <div className="flex min-h-[70vh] flex-col bg-[#F6F1E8]">
      <div className="shrink-0 px-6 pb-2 pt-6 md:px-10">
        <DiscoverySearchBar value={searchDraft} onChange={setSearchDraft} onSearch={(v) => commitSearch(v)} />
      </div>

      <div className="flex flex-1 flex-col md:flex-row">
        <aside className="shrink-0 border-b border-[#D4CEC2] bg-[#E8E3D8]/90 px-5 py-5 md:w-[220px] md:border-b-0 md:border-r md:py-6">
          <Title level={5} className="!mb-4 !mt-0 !text-[#1E3322]">
            分类
          </Title>
          <ul className="list-none space-y-1.5 pl-0">
            {SIDES.map((s) => (
              <li key={s.key}>
                <Link
                  to={categoriesHref(s.key, qCommitted)}
                  onClick={() => setActive(s.key)}
                  className={`block w-full rounded-lg px-3 py-2 text-left text-[13px] no-underline transition-colors ${
                    active === s.key
                      ? 'bg-[#2D6B3F] font-medium text-white shadow-sm'
                      : 'text-[#1E3322] hover:bg-white/70'
                  }`}
                >
                  {s.label}
                </Link>
              </li>
            ))}
          </ul>
        </aside>
        <div className="flex-1 p-6 md:p-9">
          <div className="mb-6">
            <Title level={4} className="font-display !mb-1 !text-[#1E3322] !tracking-tight md:!text-[1.35rem]">
              按分类浏览 · {SIDES.find((s) => s.key === active)?.label}
            </Title>
            <Text className="text-[13px] text-[#6B7B6B]">
              {qCommitted.trim() ? `关键词「${qCommitted.trim()}」· 书名匹配` : '浏览该分类下的在售书籍'}
            </Text>
          </div>
          <Spin spinning={isLoading}>
            <Row gutter={[16, 24]}>
              {items.map((book) => (
                <Col xs={12} sm={8} md={6} key={book.id}>
                  <BookCard book={book} />
                </Col>
              ))}
            </Row>
          </Spin>
          {!isLoading && items.length === 0 && (
            <Typography.Paragraph type="secondary">
              {qCommitted.trim() ? '没有找到匹配的书籍。' : '该分类下暂无书籍。'}
            </Typography.Paragraph>
          )}
        </div>
      </div>
    </div>
  );
}

export default Component;
