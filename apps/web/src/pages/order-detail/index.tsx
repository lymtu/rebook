import {
  Button,
  Card,
  Descriptions,
  Form,
  Input,
  Modal,
  Space,
  Spin,
  Steps,
  Tag,
  Typography,
  message,
} from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import { useMe } from '@/features/auth/api';
import {
  useCancelOrder,
  useMockConfirmPayment,
  useOpenDispute,
  useOrder,
  usePatchOrder,
  usePreparePayment,
} from '@/features/order/api';
import { ApiError } from '@/lib/api';

const { Title, Text, Paragraph } = Typography;

const statusZh: Record<string, string> = {
  pending_payment: '待支付',
  paid: '已支付',
  awaiting_handover: '待交割',
  completed: '已完成',
  cancelled: '已取消',
};

export function Component() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: me } = useMe();
  const { data: order, isLoading, refetch } = useOrder(id);
  const cancel = useCancelOrder(id ?? '');
  const patch = usePatchOrder(id ?? '');
  const prepare = usePreparePayment();
  const confirm = useMockConfirmPayment();
  const openDispute = useOpenDispute();

  const [disputeOpen, setDisputeOpen] = useState(false);
  const [fulfillOpen, setFulfillOpen] = useState(false);
  const [form] = Form.useForm<{ reason: string }>();
  const [fform] = Form.useForm<{ fulfillmentNote?: string; pickupAddress?: string }>();

  if (isLoading || !id) {
    return (
      <div className="flex justify-center py-24">
        <Spin size="large" />
      </div>
    );
  }
  if (!order || !me) {
    return <Paragraph>订单不存在或请先登录。</Paragraph>;
  }

  const isBuyer = me.id === order.buyerId;
  const isSeller = me.id === order.sellerId;
  if (!isBuyer && !isSeller) {
    return <Paragraph>无权查看该订单。</Paragraph>;
  }

  const stepIndex =
    order.status === 'pending_payment'
      ? 0
      : order.status === 'paid'
        ? 1
        : order.status === 'awaiting_handover'
          ? 2
          : order.status === 'completed'
            ? 3
            : 0;

  const mockPay = async () => {
    try {
      const prep = await prepare.mutateAsync(order.id);
      await confirm.mutateAsync({ orderId: order.id, token: prep.mockConfirmToken });
      message.success('支付成功（模拟）');
      void refetch();
    } catch (e) {
      if (e instanceof ApiError) message.error(e.message);
      else message.error('支付失败');
    }
  };

  return (
    <div className="space-y-6 max-w-3xl px-6 md:px-10 py-8 bg-[#F6F1E8] min-h-[70vh]">
      <Title level={4} className="font-display !text-[#1E3322]">
        订单详情
      </Title>
      <Tag className="text-base px-3 py-1 !rounded !border-[#D4CEC2]">{statusZh[order.status] ?? order.status}</Tag>

      <Steps
        current={order.status === 'cancelled' ? 0 : stepIndex}
        items={[
          { title: '待支付' },
          { title: '已支付' },
          { title: '交割中' },
          { title: '已完成' },
        ]}
        className={order.status === 'cancelled' ? 'opacity-50' : ''}
      />

      <Descriptions bordered size="small" column={1}>
        <Descriptions.Item label="订单号">{order.id}</Descriptions.Item>
        <Descriptions.Item label="商品小计">
          ¥{(order.subtotalCents / 100).toFixed(2)}
        </Descriptions.Item>
        <Descriptions.Item label="平台费（卖家侧快照）">
          ¥{(order.platformFeeCents / 100).toFixed(2)}（费率 {order.feeRateBpsSnapshot / 100}%）
        </Descriptions.Item>
        <Descriptions.Item label="应付">
          <Text strong>¥{(order.totalCents / 100).toFixed(2)}</Text>
        </Descriptions.Item>
      </Descriptions>

      <Card title="商品明细" size="small">
        <ul className="list-none pl-0 space-y-2">
          {order.items.map((it) => (
            <li key={it.id} className="flex justify-between">
              <span>{it.titleSnapshot}</span>
              <span>
                ¥{(it.priceCents / 100).toFixed(2)} × {it.quantity}
              </span>
            </li>
          ))}
        </ul>
      </Card>

      {(order.fulfillmentNote || order.pickupAddress) && (
        <Card title="履约信息" size="small">
          {order.fulfillmentNote && <Paragraph>备注：{order.fulfillmentNote}</Paragraph>}
          {order.pickupAddress && <Paragraph>地址：{order.pickupAddress}</Paragraph>}
        </Card>
      )}

      <Space wrap>
        {isBuyer && order.status === 'pending_payment' && (
          <>
            {import.meta.env.DEV && (
              <Button type="primary" onClick={() => void mockPay()} loading={prepare.isPending || confirm.isPending}>
                模拟支付（开发）
              </Button>
            )}
            <Button danger loading={cancel.isPending} onClick={() => void cancel.mutateAsync()}>
              取消订单
            </Button>
          </>
        )}
        {isSeller && (order.status === 'paid' || order.status === 'awaiting_handover') && (
          <Button onClick={() => setFulfillOpen(true)}>填写交割/自提信息</Button>
        )}
        {isSeller && order.status === 'paid' && (
          <Button
            onClick={() =>
              void patch.mutateAsync({ status: 'awaiting_handover' }).then(() => {
                message.success('已更新为待交割');
                void refetch();
              })
            }
          >
            标记为待交割
          </Button>
        )}
        {(isBuyer || isSeller) &&
          (order.status === 'awaiting_handover' || order.status === 'paid') && (
            <Button
              type="primary"
              ghost
              onClick={() =>
                void patch.mutateAsync({ status: 'completed' }).then(() => {
                  message.success('订单已完成');
                  void refetch();
                })
              }
            >
              确认完成交割
            </Button>
          )}
        {isBuyer && ['paid', 'awaiting_handover'].includes(order.status) && (
          <Button onClick={() => setDisputeOpen(true)}>申请纠纷</Button>
        )}
        <Button onClick={() => navigate('/orders')}>返回列表</Button>
      </Space>

      <Modal
        title="申请纠纷"
        open={disputeOpen}
        onCancel={() => setDisputeOpen(false)}
        onOk={() => {
          void form.validateFields().then(async (v) => {
            try {
              await openDispute.mutateAsync({ orderId: order.id, reason: v.reason });
              message.success('已提交');
              setDisputeOpen(false);
              form.resetFields();
            } catch (e) {
              if (e instanceof ApiError) message.error(e.message);
            }
          });
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="reason" label="原因" rules={[{ required: true, message: '请填写原因' }]}>
            <Input.TextArea rows={4} maxLength={4000} showCount />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="交割信息"
        open={fulfillOpen}
        onCancel={() => setFulfillOpen(false)}
        onOk={() => {
          void fform.validateFields().then(async (v) => {
            try {
              await patch.mutateAsync({
                fulfillmentNote: v.fulfillmentNote,
                pickupAddress: v.pickupAddress,
              });
              message.success('已保存');
              setFulfillOpen(false);
              void refetch();
            } catch (e) {
              if (e instanceof ApiError) message.error(e.message);
            }
          });
        }}
      >
        <Form form={fform} layout="vertical">
          <Form.Item name="pickupAddress" label="地址 / 自提点">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="fulfillmentNote" label="备注 / 时间">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default Component;
