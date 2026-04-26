import { Button, Input, Modal, Table, Typography, message } from 'antd';
import { useState } from 'react';
import type { DisputeDTO } from '@rebook/shared';
import { useOpenDisputes, useResolveDispute } from '@/features/dispute/api';
import { Link } from 'react-router-dom';

const { Paragraph, Text } = Typography;

/** 【管理】纠纷仲裁 — 对接 GET /disputes/open、POST resolve */
export function Component() {
  const { data, isLoading, refetch } = useOpenDisputes();
  const resolve = useResolveDispute();
  const [openId, setOpenId] = useState<string | null>(null);
  const [resolution, setResolution] = useState('');

  const submit = () => {
    if (!openId || !resolution.trim()) {
      message.warning('请填写处理说明');
      return;
    }
    void resolve
      .mutateAsync({ id: openId, input: { resolution: resolution.trim() } })
      .then(() => {
        message.success('已结案');
        setOpenId(null);
        setResolution('');
        void refetch();
      })
      .catch(() => message.error('操作失败'));
  };

  const columns = [
    {
      title: '订单',
      key: 'order',
      render: (_: unknown, r: DisputeDTO) => (
        <Link to={`/orders/${r.orderId}`} className="text-[#2D6B3F]">
          查看订单
        </Link>
      ),
    },
    {
      title: '事由',
      dataIndex: 'reason',
      key: 'reason',
      ellipsis: true,
      render: (t: string) => <Text className="text-[13px]">{t}</Text>,
    },
    {
      title: '发起人',
      key: 'by',
      width: 120,
      render: (_: unknown, r: DisputeDTO) => <Text copyable={{ text: r.openedByUserId }}>{r.openedByUserId.slice(0, 8)}…</Text>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 88,
    },
    {
      title: '操作',
      key: 'act',
      width: 100,
      render: (_: unknown, r: DisputeDTO) => (
        <Button type="link" size="small" className="!text-[#2D6B3F]" onClick={() => setOpenId(r.id)}>
          结案
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <Typography.Title level={4} className="font-display !mb-1 !text-[#1E3322]">
        纠纷仲裁
      </Typography.Title>
      <Paragraph className="!mb-0 !max-w-3xl !text-sm !leading-relaxed !text-[#4A5A4A]">
        处理线下爽约、描述不符等纠纷；结案后请写清处理依据，用户可在订单中查看关联。
      </Paragraph>
      <div className="rounded-xl border border-[#D4CEC2] bg-white p-4 shadow-sm">
        <Table<DisputeDTO>
          rowKey="id"
          loading={isLoading}
          dataSource={data}
          columns={columns}
          pagination={false}
          locale={{ emptyText: '暂无待处理纠纷' }}
        />
      </div>
      <Modal title="结案说明" open={Boolean(openId)} onCancel={() => setOpenId(null)} onOk={submit} okText="确认结案">
        <Input.TextArea rows={4} value={resolution} onChange={(e) => setResolution(e.target.value)} placeholder="处理结果与依据（对用户可见）" />
      </Modal>
    </div>
  );
}

export default Component;
