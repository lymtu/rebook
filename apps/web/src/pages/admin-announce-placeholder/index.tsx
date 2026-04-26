import { Button, Card, Form, Input, InputNumber, Table, Typography, message } from 'antd';
import type { AnnouncementDTO, CreateAnnouncementInput } from '@rebook/shared';
import { useAnnouncements, useCreateAnnouncement } from '@/features/announcement/api';

/** 【管理】校园公告 */
export function Component() {
  const { data, isLoading, refetch } = useAnnouncements();
  const create = useCreateAnnouncement();
  const [form] = Form.useForm<CreateAnnouncementInput>();

  const onFinish = (vals: CreateAnnouncementInput) => {
    void create
      .mutateAsync(vals)
      .then(() => {
        message.success('已发布');
        form.resetFields();
        void refetch();
      })
      .catch(() => message.error('发布失败'));
  };

  const columns = [
    { title: '标题', dataIndex: 'title', key: 'title', ellipsis: true },
    {
      title: '正文摘要',
      dataIndex: 'body',
      key: 'body',
      ellipsis: true,
      render: (b: string) => (b.length > 80 ? `${b.slice(0, 80)}…` : b),
    },
    { title: '置顶', dataIndex: 'pinSort', key: 'pinSort', width: 72 },
    {
      title: '发布时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (t: string) => new Date(t).toLocaleString(),
    },
  ];

  return (
    <div className="space-y-4">
      <Typography.Title level={4} className="font-display !mb-1 !text-[#1E3322]">
        校园公告
      </Typography.Title>
      <Typography.Paragraph className="!mb-0 !text-sm !text-[#4A5A4A]">
        公告会展示在用户站首页；支持置顶排序（数字越大越靠前）。
      </Typography.Paragraph>

      <Card className="!rounded-xl !border-[#D4CEC2] !shadow-sm" size="small" title="发布新公告">
        <Form form={form} layout="vertical" onFinish={onFinish} className="max-w-xl">
          <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入标题' }]}>
            <Input maxLength={200} showCount />
          </Form.Item>
          <Form.Item name="body" label="正文" rules={[{ required: true, message: '请输入正文' }]}>
            <Input.TextArea rows={5} maxLength={20_000} showCount />
          </Form.Item>
          <Form.Item name="pinSort" label="置顶" initialValue={0}>
            <InputNumber min={0} max={999} className="!w-full" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={create.isPending} className="!bg-[#2D6B3F]">
              发布
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <div className="rounded-xl border border-[#D4CEC2] bg-white p-4 shadow-sm">
        <Typography.Title level={5} className="!mt-0 !text-[#1E3322]">
          近期公告
        </Typography.Title>
        <Table<AnnouncementDTO> rowKey="id" loading={isLoading} dataSource={data} columns={columns} pagination={false} />
      </div>
    </div>
  );
}

export default Component;
