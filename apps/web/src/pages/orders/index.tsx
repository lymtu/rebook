import { List, Tabs, Tag, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useOrders } from '@/features/order/api';
import { useMe } from '@/features/auth/api';

const { Title, Paragraph, Text } = Typography;

const statusZh: Record<string, string> = {
  pending_payment: '待支付',
  paid: '已支付',
  awaiting_handover: '待交割',
  completed: '已完成',
  cancelled: '已取消',
};

/** 【用户】08 我的订单 — rebook.pen W08 */
export function Component() {
  const { data: me, isLoading: meLoading } = useMe();
  const [tab, setTab] = useState<'buyer' | 'seller'>('buyer');
  const { data, isLoading } = useOrders({ as: tab });

  if (meLoading) return <div className="p-10 bg-[#F6F1E8]">加载中…</div>;
  if (!me) {
    return (
      <div className="p-10 bg-[#F6F1E8]">
        <Paragraph>
          请先 <Link to="/login">登录</Link>。
        </Paragraph>
      </div>
    );
  }

  return (
    <div className="bg-[#F6F1E8] min-h-[70vh] px-6 md:px-10 py-8">
      <Title level={3} className="font-display !text-[#1E3322] !mb-6">
        我的订单
      </Title>
      <Tabs
        activeKey={tab}
        onChange={(k) => setTab(k as 'buyer' | 'seller')}
        className="rebook-orders-tabs"
        items={[
          { key: 'buyer', label: '我买到的' },
          { key: 'seller', label: '我卖出的' },
        ]}
      />
      <List
        loading={isLoading}
        dataSource={data?.items}
        locale={{ emptyText: '暂无订单' }}
        className="mt-4"
        renderItem={(o) => (
          <List.Item className="!px-0 !border-[#E5E0D6]">
            <div className="w-full flex flex-wrap justify-between gap-2 items-center bg-white/60 rounded border border-[#E8E0D4] px-4 py-3">
              <div>
                <Link to={`/orders/${o.id}`} className="text-[#1E3322] font-semibold">
                  订单 {o.id.slice(0, 12)}…
                </Link>
                <div className="text-[#6B7B6B] text-xs mt-1">
                  {tab === 'buyer' ? `卖家 ${o.sellerId.slice(0, 8)}…` : `买家 ${o.buyerId.slice(0, 8)}…`}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Tag className="!rounded !border-[#D4CEC2]">{statusZh[o.status] ?? o.status}</Tag>
                <Text strong className="!text-[#2D6B3F] text-base">
                  ¥{(o.totalCents / 100).toFixed(2)}
                </Text>
              </div>
            </div>
          </List.Item>
        )}
      />
    </div>
  );
}

export default Component;
