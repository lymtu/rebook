import {
  Breadcrumb,
  Button,
  Descriptions,
  Image,
  Space,
  Spin,
  Tag,
  Typography,
  message,
} from 'antd';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { BOOK_CONDITION_LABEL, BOOK_STATUS_LABEL } from '@rebook/shared';
import { useBook } from '@/features/book/api';
import { publicAssetUrl } from '@/features/book/public-url';
import { useAddToCart } from '@/features/cart/api';
import { useMe } from '@/features/auth/api';
import { ApiError } from '@/lib/api';

const { Title, Paragraph, Text } = Typography;

/** 【用户】04 商品详情 — rebook.pen W04 */
export function Component() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: me } = useMe();
  const { data: book, isLoading, error } = useBook(id);
  const add = useAddToCart();

  if (isLoading) {
    return (
      <div className="flex justify-center py-24 bg-[#F6F1E8]">
        <Spin size="large" />
      </div>
    );
  }
  if (error || !book) {
    return (
      <div className="p-10 bg-[#F6F1E8]">
        <Paragraph type="danger">书籍不存在或无权查看。</Paragraph>
      </div>
    );
  }

  const src = publicAssetUrl(book.coverImageKey);
  const isOwner = me?.id === book.sellerId;
  const canBuy = book.status === 'ON_SALE' && !isOwner;

  const onAddCart = async () => {
    if (!me) {
      message.info('请先登录');
      navigate('/login');
      return;
    }
    try {
      await add.mutateAsync({ bookId: book.id });
      message.success('已加入购物车');
    } catch (e) {
      if (e instanceof ApiError) message.error(e.message);
      else message.error('加入购物车失败');
    }
  };

  return (
    <div className="bg-[#F6F1E8]">
      <div className="h-12 flex items-center px-6 md:px-10 bg-[#F6F1E8] border-b border-[#E5E0D6]">
        <Breadcrumb
          items={[
            { title: <Link to="/">发现</Link> },
            { title: <Link to="/categories">分类</Link> },
            { title: <span className="text-[#1E3322]">详情</span> },
          ]}
        />
      </div>
      <div className="flex flex-col lg:flex-row gap-10 lg:gap-12 px-6 md:px-10 py-8">
        <div className="w-full lg:w-72 shrink-0">
          <div className="rounded border border-[#E8E0D4] overflow-hidden bg-[#F3F0E8] aspect-[3/4] flex items-center justify-center">
            {src ? <Image src={src} alt="" className="object-cover w-full h-full" preview /> : <Text type="secondary">暂无封面</Text>}
          </div>
        </div>
        <div className="flex-1 min-w-0 space-y-4">
          <Tag className="!rounded !border-[#D4CEC2] !text-[#1E3322] !bg-white">{BOOK_STATUS_LABEL[book.status]}</Tag>
          <Title level={2} className="font-display !text-[#1E3322] !mb-2 !mt-0">
            {book.title}
          </Title>
          <Text className="text-[#6B7B6B]">{BOOK_CONDITION_LABEL[book.conditionGrade]}</Text>
          <div className="text-[#2D6B3F] text-2xl font-semibold">¥{(book.priceCents / 100).toFixed(2)}</div>
          {book.rejectReason && (
            <Paragraph className="!text-amber-800 !bg-[#F8F4EC] !p-3 !rounded border border-[#C8A882]">
              驳回原因：{book.rejectReason}
            </Paragraph>
          )}
          <Descriptions column={1} size="small" bordered className="!bg-white">
            {book.author && <Descriptions.Item label="作者">{book.author}</Descriptions.Item>}
            {book.isbn && <Descriptions.Item label="ISBN">{book.isbn}</Descriptions.Item>}
            {book.description && <Descriptions.Item label="简介">{book.description}</Descriptions.Item>}
          </Descriptions>
          <Space wrap className="pt-2">
            {canBuy && (
              <Button type="primary" size="large" className="!bg-[#2D6B3F]" onClick={() => void onAddCart()} loading={add.isPending}>
                加入购物车
              </Button>
            )}
            {isOwner && (
              <>
                <Button onClick={() => navigate('/my-books')}>我的书籍</Button>
                <Button onClick={() => navigate(`/books/${book.id}/edit`)}>编辑</Button>
              </>
            )}
          </Space>
        </div>
      </div>
    </div>
  );
}

export default Component;
