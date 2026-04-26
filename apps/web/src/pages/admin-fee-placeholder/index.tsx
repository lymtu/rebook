import { Button, Card, Form, Input, InputNumber, Modal, Space, Table, Tag, Typography, message } from 'antd';
import { useState } from 'react';
import type { FeeProposalDTO } from '@rebook/shared';
import { useMe } from '@/features/auth/api';
import { useEffectiveFee, useFeeProposals, useProposeFee, useReviewFeeProposal } from '@/features/fee/api';

const STATUS_TAG: Record<string, { color: string; label: string }> = {
  pending: { color: 'gold', label: '待审批' },
  approved: { color: 'green', label: '已通过' },
  rejected: { color: 'red', label: '已驳回' },
};

function bpsToPercent(bps: number) {
  return `${(bps / 100).toFixed(2)}%`;
}

/** 【管理】平台费率 */
export function Component() {
  const { data: me } = useMe();
  const { data: effective, isLoading: effLoading } = useEffectiveFee();
  const { data: proposals, isLoading: listLoading, refetch } = useFeeProposals();
  const propose = useProposeFee();
  const review = useReviewFeeProposal();
  const isSuper = me?.role === 'super_admin';
  const [reviewRow, setReviewRow] = useState<FeeProposalDTO | null>(null);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve');
  const [note, setNote] = useState('');

  const onPropose = (vals: { rateBps: number }) => {
    void propose
      .mutateAsync({ rateBps: vals.rateBps })
      .then(() => {
        message.success('已提交费率提案');
        void refetch();
      })
      .catch(() => message.error('提交失败'));
  };

  const submitReview = () => {
    if (!reviewRow) return;
    void review
      .mutateAsync({ id: reviewRow.id, input: { action: reviewAction, note: note.trim() || undefined } })
      .then(() => {
        message.success('已处理');
        setReviewRow(null);
        setNote('');
        void refetch();
      })
      .catch(() => message.error('操作失败'));
  };

  const columns = [
    { title: '费率', key: 'bps', render: (_: unknown, r: FeeProposalDTO) => bpsToPercent(r.rateBps) },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (s: string) => {
        const x = STATUS_TAG[s] ?? { color: 'default', label: s };
        return <Tag color={x.color}>{x.label}</Tag>;
      },
    },
    {
      title: '提交时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (t: string) => new Date(t).toLocaleString(),
    },
    {
      title: '操作',
      key: 'act',
      render: (_: unknown, r: FeeProposalDTO) =>
        isSuper && r.status === 'pending' ? (
          <Space>
            <Button
              type="link"
              size="small"
              className="!text-[#2D6B3F]"
              onClick={() => {
                setReviewRow(r);
                setReviewAction('approve');
                setNote('');
              }}
            >
              通过
            </Button>
            <Button
              type="link"
              size="small"
              danger
              onClick={() => {
                setReviewRow(r);
                setReviewAction('reject');
                setNote('');
              }}
            >
              驳回
            </Button>
          </Space>
        ) : null,
    },
  ];

  return (
    <div className="space-y-4">
      <Typography.Title level={4} className="font-display !mb-1 !text-[#1E3322]">
        平台服务费
      </Typography.Title>
      <Typography.Paragraph className="!mb-0 !text-sm !text-[#4A5A4A]">
        当前成交费率来自最近一条「已通过」提案；新提案需超级管理员审批后生效。
      </Typography.Paragraph>

      <Card loading={effLoading} className="!rounded-xl !border-[#D4CEC2] !shadow-sm" size="small" title="当前生效费率">
        <Typography.Text className="text-lg font-semibold text-[#2D6B3F]">
          {effective ? bpsToPercent(effective.rateBps) : '—'}
        </Typography.Text>
      </Card>

      <Card className="!rounded-xl !border-[#D4CEC2] !shadow-sm" size="small" title="提交新提案（基点 bps，100 = 1%）">
        <Form layout="inline" onFinish={onPropose} initialValues={{ rateBps: 500 }}>
          <Form.Item name="rateBps" label="费率 bps" rules={[{ required: true }]}>
            <InputNumber min={0} max={5000} className="!w-32" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={propose.isPending} className="!bg-[#2D6B3F]">
              提交审批
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <div className="rounded-xl border border-[#D4CEC2] bg-white p-4 shadow-sm">
        <Typography.Title level={5} className="!mt-0 !text-[#1E3322]">
          提案历史
        </Typography.Title>
        <Table<FeeProposalDTO> rowKey="id" loading={listLoading} dataSource={proposals} columns={columns} pagination={false} />
      </div>

      <Modal
        title={reviewAction === 'approve' ? '通过提案' : '驳回提案'}
        open={Boolean(reviewRow)}
        onCancel={() => setReviewRow(null)}
        onOk={submitReview}
        okText="确认"
      >
        <Input.TextArea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="备注（可选）" />
      </Modal>
    </div>
  );
}

export default Component;
