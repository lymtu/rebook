import { Typography } from 'antd';
import { Link } from 'react-router-dom';

const { Title, Paragraph } = Typography;

/** 【用户】11 消息中心 — placeholder matching rebook.pen structure */
export function Component() {
  const items = [
    { title: '订单通知', body: '您有新的订单状态更新（示意）', active: false },
    { title: '系统公告', body: '考试周自提时间调整说明…', active: false },
    { title: '纠纷 / 仲裁', body: '暂无待处理（示意）', active: true },
  ];

  return (
    <div className="bg-[#F6F1E8] min-h-[70vh] p-6 md:p-8">
      <Title level={4} className="font-display !text-[#1E3322]">
        消息中心
      </Title>
      <Paragraph type="secondary" className="!mb-6">
        与订单、公告相关的通知将出现在此（接口联调后可接真实数据）。
      </Paragraph>
      <div className="space-y-4 max-w-2xl">
        {items.map((it, i) => (
          <div
            key={i}
            className={`rounded-md border p-5 ${
              it.active ? 'bg-[#F0EDE4] border-[#D4CEC2]' : 'bg-white border-[#D4CEC2]'
            }`}
          >
            <div className="font-semibold text-[#1E3322]">{it.title}</div>
            <div className="text-[#6B7B6B] text-sm mt-2">{it.body}</div>
          </div>
        ))}
      </div>
      <div className="mt-8">
        <Link to="/orders" className="text-[#2D6B3F]">
          查看买卖记录 →
        </Link>
      </div>
    </div>
  );
}

export default Component;
