import { Breadcrumb, Button, Typography, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { useCart, useCheckout, useRemoveCartLine } from '@/features/cart/api';
import { useEffectiveFee } from '@/features/fee/api';
import { useMe } from '@/features/auth/api';
import { publicAssetUrl } from '@/features/book/public-url';
import { ApiError } from '@/lib/api';

const { Text, Paragraph } = Typography;

/** 【用户】05 购物车 — rebook.pen W05 */
export function Component() {
  const navigate = useNavigate();
  const { data: me, isLoading: meLoading } = useMe();
  const { data: lines, isLoading } = useCart(!meLoading && Boolean(me));
  const { data: fee } = useEffectiveFee();
  const remove = useRemoveCartLine();
  const checkout = useCheckout();

  if (meLoading) {
    return (
      <div className="flex justify-center py-24 bg-[#F6F1E8]">
        <Text>加载中…</Text>
      </div>
    );
  }
  if (!me) {
    return (
      <div className="p-10 bg-[#F6F1E8]">
        <Paragraph>
          请先 <Link to="/login">登录</Link> 查看购物车。
        </Paragraph>
      </div>
    );
  }

  const subtotal = lines?.reduce((s, l) => s + l.book.priceCents * l.quantity, 0) ?? 0;

  const onCheckout = async () => {
    try {
      const res = await checkout.mutateAsync();
      message.success(`已生成 ${res.orderIds.length} 个订单`);
      navigate('/orders');
    } catch (e) {
      if (e instanceof ApiError) message.error(e.message);
      else message.error('结算失败');
    }
  };

  return (
    <div className="bg-[#F6F1E8] min-h-[70vh] flex flex-col">
      <div className="h-14 flex items-center justify-between px-6 md:px-10 bg-[#FAFAF7] border-b border-[#E5E0D6]">
        <Breadcrumb items={[{ title: <Link to="/">发现</Link> }, { title: '购物车' }]} />
        <Text className="text-[#1E3322] font-medium">购物车</Text>
      </div>

      <div className="px-6 md:px-10 py-3 bg-[#F3F0E8] text-xs text-[#6B7B6B] border-b border-[#E5E0D6] flex gap-8">
        <span className="flex-1">商品</span>
        <span className="w-24 text-right">单价</span>
        <span className="w-20 text-right">操作</span>
      </div>

      <div className="flex-1">
        {isLoading ? (
          <div className="p-10 text-center text-[#6B7B6B]">加载中…</div>
        ) : !lines?.length ? (
          <div className="p-10 text-center text-[#6B7B6B]">购物车是空的</div>
        ) : (
          lines.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 px-6 md:px-10 py-4 border-b border-[#E5E0D6] hover:bg-[#FAFAF7]/50"
            >
              <div className="w-14 h-[4.5rem] rounded overflow-hidden bg-[#E8E3D8] shrink-0">
                {publicAssetUrl(item.book.coverImageKey) ? (
                  <img src={publicAssetUrl(item.book.coverImageKey)} alt="" className="w-full h-full object-cover" />
                ) : null}
              </div>
              <div className="flex-1 min-w-0">
                <Link to={`/books/${item.book.id}`} className="text-[#1E3322] font-semibold">
                  {item.book.title}
                </Link>
                <div className="text-[#6B7B6B] text-xs mt-1">卖家 {item.book.sellerId.slice(0, 8)}…</div>
              </div>
              <div className="w-24 text-right text-[#2D6B3F] font-semibold">¥{(item.book.priceCents / 100).toFixed(2)}</div>
              <div className="w-20 text-right">
                <Button type="link" danger size="small" loading={remove.isPending} onClick={() => void remove.mutateAsync(item.bookId)}>
                  删除
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-auto bg-[#FAFAF7] border-t border-[#E5E0D6] px-6 md:px-10 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="text-sm text-[#6B7B6B]">
          {fee && (
            <>
              当前费率快照约 <Text strong className="!text-[#1E3322]">{(fee.rateBps / 100).toFixed(2)}%</Text>（向卖家侧）
            </>
          )}
        </div>
        <div className="flex items-center gap-6">
          <span className="text-[#1E3322]">
            合计 <Text strong className="!text-xl !text-[#2D6B3F]">¥{(subtotal / 100).toFixed(2)}</Text>
          </span>
          <Button
            type="primary"
            size="large"
            disabled={!lines?.length}
            loading={checkout.isPending}
            onClick={() => void onCheckout()}
            className="!bg-[#2D6B3F]"
          >
            结算（按卖家拆单）
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Component;
