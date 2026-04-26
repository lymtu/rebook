import { Button, Col, Input, Row, Space, Spin, Tag, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { BOOK_STATUS_LABEL } from '@rebook/shared';
import { useMe } from '@/features/auth/api';
import { useMyBooks } from '@/features/book/api';
import { BookCard } from '@/components/book-card';

const { Title, Paragraph } = Typography;

export function Component() {
  const { data: me, isLoading: meLoading, isError: meErr } = useMe();
  const [q, setQ] = useState('');
  const [search, setSearch] = useState('');
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useMyBooks(search);

  const items = data?.pages.flatMap((p) => p.items) ?? [];

  if (meLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spin />
      </div>
    );
  }
  if (!me || meErr) {
    return (
      <Paragraph>
        请先 <Link to="/login">登录</Link>。
      </Paragraph>
    );
  }

  return (
    <div className="space-y-6 px-6 md:px-10 py-8 bg-[#F6F1E8] min-h-[70vh]">
      <div className="flex flex-wrap justify-between gap-4 items-center">
        <Title level={3} className="font-display !text-[#1E3322] !mb-0">
          我的书籍
        </Title>
        <Link to="/sell">
          <Button type="primary" className="!bg-[#2D6B3F]">
            发布新书
          </Button>
        </Link>
      </div>
      <Space.Compact>
        <Input
          placeholder="搜索我的书"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onPressEnter={() => setSearch(q.trim())}
          allowClear
        />
        <Button type="primary" className="!bg-[#2D6B3F]" onClick={() => setSearch(q.trim())}>
          搜索
        </Button>
      </Space.Compact>

      <Spin spinning={isLoading}>
        <Row gutter={[16, 16]}>
          {items.map((book) => (
            <Col xs={12} sm={8} md={6} key={book.id}>
              <div className="relative">
                <BookCard book={book} />
                <Tag className="absolute top-2 right-2 !m-0">{BOOK_STATUS_LABEL[book.status]}</Tag>
              </div>
              <div className="mt-2 text-center">
                <Link to={`/books/${book.id}/edit`}>
                  <Button size="small" type="link">
                    编辑
                  </Button>
                </Link>
              </div>
            </Col>
          ))}
        </Row>
      </Spin>

      {hasNextPage && (
        <div className="text-center">
          <Button loading={isFetchingNextPage} onClick={() => void fetchNextPage()}>
            加载更多
          </Button>
        </div>
      )}
    </div>
  );
}

export default Component;
