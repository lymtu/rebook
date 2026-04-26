import { Alert, Button, Input, Modal, Space, Table, Typography, message } from 'antd';
import { useState } from 'react';
import { BOOK_CONDITION_LABEL } from '@rebook/shared';
import type { BookDTO } from '@rebook/shared';
import { usePendingBooks, useReviewBook } from '@/features/admin/api';
import { publicAssetUrl } from '@/features/book/public-url';
import { Link } from 'react-router-dom';

const { Text } = Typography;

/** 【管理】13 管理-商品审核 — rebook.pen aEkpO */
export function Component() {
  const { data, isLoading, refetch } = usePendingBooks();
  const review = useReviewBook();
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [reason, setReason] = useState('');

  const onApprove = (id: string) => {
    void review
      .mutateAsync({ id, input: { action: 'approve' } })
      .then(() => {
        message.success('已通过');
        void refetch();
      })
      .catch(() => message.error('操作失败'));
  };

  const submitReject = () => {
    if (!rejectId || !reason.trim()) {
      message.warning('请填写驳回原因');
      return;
    }
    void review
      .mutateAsync({ id: rejectId, input: { action: 'reject', rejectReason: reason.trim() } })
      .then(() => {
        message.success('已驳回');
        setRejectId(null);
        setReason('');
        void refetch();
      })
      .catch(() => message.error('操作失败'));
  };

  const columns = [
    {
      title: '封面',
      key: 'cover',
      width: 72,
      render: (_: unknown, r: BookDTO) => {
        const u = publicAssetUrl(r.coverImageKey);
        return u ? <img src={u} alt="" className="w-12 h-16 object-cover rounded" /> : '—';
      },
    },
    { title: '书名', dataIndex: 'title', key: 'title' },
    {
      title: '成色',
      key: 'cond',
      render: (_: unknown, r: BookDTO) => BOOK_CONDITION_LABEL[r.conditionGrade],
    },
    {
      title: '价格',
      key: 'price',
      render: (_: unknown, r: BookDTO) => `¥${(r.priceCents / 100).toFixed(2)}`,
    },
    {
      title: '卖家',
      key: 'seller',
      render: (_: unknown, r: BookDTO) => (
        <Text copyable={{ text: r.sellerId }}>{r.sellerId.slice(0, 10)}…</Text>
      ),
    },
    {
      title: '操作',
      key: 'act',
      render: (_: unknown, r: BookDTO) => (
        <Space>
          <Link to={`/books/${r.id}`} target="_blank" rel="noreferrer" className="text-[#2D6B3F]">
            查看
          </Link>
          <Button type="link" size="small" className="!text-[#2D6B3F]" onClick={() => onApprove(r.id)}>
            通过
          </Button>
          <Button type="link" size="small" danger onClick={() => setRejectId(r.id)}>
            驳回
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      <Typography.Title level={4} className="font-display !text-[#1E3322] !mb-1">
        商品与待审
      </Typography.Title>
      <Typography.Paragraph className="!mb-4 !text-xs !leading-relaxed !text-[#4A5A4A]">
        审核教材/通识/考试类上架 · 禁止引导脱离平台 · 可驳回并要求补充实拍
      </Typography.Paragraph>
      <Alert
        type="info"
        showIcon
        className="!mb-4 !rounded-lg !border-[#D4CEC2] !bg-[#F3F0E8]"
        message="待审队列"
        description="列表为待审核书籍；通过后将对外展示，驳回需填写原因。"
      />
      <div className="rounded-xl border border-[#D4CEC2] bg-white p-4 shadow-sm">
        <Table<BookDTO> rowKey="id" loading={isLoading} dataSource={data?.items} columns={columns} pagination={false} />
      </div>
      <Modal title="驳回原因" open={Boolean(rejectId)} onCancel={() => setRejectId(null)} onOk={submitReject}>
        <Input.TextArea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="须填写原因" />
      </Modal>
    </div>
  );
}

export default Component;
