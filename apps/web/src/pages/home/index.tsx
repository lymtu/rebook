import { Button, Col, List, Row, Spin, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useAnnouncements } from '@/features/announcement/api';
import { useBooksInfinite } from '@/features/book/api';
import { BookCard } from '@/components/book-card';
import { DiscoverySearchBar } from '@/components/discovery-search-bar';

const { Title, Paragraph, Text } = Typography;

const PILL_LINKS: { label: string; to: string }[] = [
  { label: '全部', to: '/categories' },
  { label: '教材', to: '/categories?s=jiaocai' },
  { label: '文学', to: '/categories?s=wenxue' },
  { label: '通识', to: '/categories?s=tongshi' },
];

/** 【用户】03 首页发现 — rebook.pen W03（搜索行 + 推荐标题 + 分类胶囊 + 书卡） */
export function Component() {
  const { data: ann } = useAnnouncements();
  const [search, setSearch] = useState('');
  const listQ = search.trim();
  const { data: books, isLoading } = useBooksInfinite(listQ);

  const showcase = books?.pages.flatMap((p) => p.items).slice(0, 8) ?? [];

  return (
    <div className="bg-[#F6F1E8]">
      <div className="px-6 md:px-10 pt-7 pb-1">
        <DiscoverySearchBar value={search} onChange={setSearch} onSearch={(v) => setSearch(v)} />
      </div>

      <div className="px-6 md:px-10 pt-5 pb-2">
        <Title level={4} className="font-display !mb-0 !text-[1.35rem] !leading-snug !tracking-tight !text-[#1E3322] md:!text-[1.5rem]">
          本周新出 · 通识向
        </Title>
        <Paragraph className="!mb-0 !mt-2 !text-[13px] !leading-relaxed !text-[#6B7B6B]">
          同校面交 · 平台按成交收取服务费（费率见公示）
        </Paragraph>
      </div>

      <div className="flex flex-wrap gap-2 px-6 pb-6 md:px-10">
        {PILL_LINKS.map((p) => (
          <Link
            key={p.label}
            to={p.to}
            className="rounded-full border border-transparent bg-[#EEEBE3] px-4 py-2 text-[13px] font-medium text-[#1E3322] no-underline shadow-sm transition-all hover:border-[#D4CEC2] hover:bg-[#E8E3D8] active:scale-[0.98]"
          >
            {p.label}
          </Link>
        ))}
      </div>

      {ann && ann.length > 0 && (
        <div className="px-6 pb-6 md:px-10">
          <div className="rounded-xl border border-[#E5E0D6] bg-white/60 px-5 py-4 shadow-[0_1px_2px_rgba(30,51,34,0.04)]">
            <Title level={5} className="!mb-3 !mt-0 !text-[#1E3322]">
              公告
            </Title>
            <List
              size="small"
              dataSource={ann.slice(0, 3)}
              className="!bg-transparent"
              split={false}
              renderItem={(item) => (
                <List.Item className="!mb-3 !rounded-lg !border !border-[#E8E3D8] !bg-[#FAFAF7]/80 !px-4 !py-3 last:!mb-0">
                  <div>
                    <Text strong className="text-[#1E3322]">
                      {item.title}
                    </Text>
                    <Paragraph type="secondary" className="!mb-0 !mt-1.5 !line-clamp-2 !text-sm !leading-relaxed !text-[#6B7B6B]">
                      {item.body}
                    </Paragraph>
                  </div>
                </List.Item>
              )}
            />
          </div>
        </div>
      )}

      <div className="px-6 pb-10 pt-2 md:px-10 md:pb-12">
        <Spin spinning={isLoading}>
          <Row gutter={[16, 24]}>
            {showcase.map((book) => (
              <Col xs={12} sm={8} md={6} key={book.id}>
                <BookCard book={book} />
              </Col>
            ))}
          </Row>
        </Spin>
        {!isLoading && showcase.length === 0 && (
          <Paragraph type="secondary" className="!text-[#6B7B6B]">
            {listQ ? '没有找到匹配的书籍。' : '暂无在售书籍。'}
          </Paragraph>
        )}
        <div className="mt-10 text-center">
          <Link to="/categories">
            <Button type="link" className="!h-auto !p-1 !text-[15px] !font-medium !text-[#2D6B3F] hover:!text-[#245a34]">
              按分类浏览 →
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Component;
