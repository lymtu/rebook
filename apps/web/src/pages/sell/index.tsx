import { Button, Form, Input, InputNumber, Select, Spin, Typography, Upload, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { BOOK_CONDITIONS, BOOK_CONDITION_LABEL, createBookInput } from '@rebook/shared';
import type { CreateBookInput } from '@rebook/shared';
import { useMe } from '@/features/auth/api';
import { useCreateBook } from '@/features/book/api';
import { uploadBookImage } from '@/features/upload/api';
import { ApiError } from '@/lib/api';

const { Title, Paragraph } = Typography;

type FormVals = Omit<CreateBookInput, 'priceCents'> & { priceYuan: number };

/** 【用户】09 发布旧书 — rebook.pen W09 */
export function Component() {
  const navigate = useNavigate();
  const { data: me, isLoading: meLoading, isError: meErr } = useMe();
  const [form] = Form.useForm<FormVals>();
  const create = useCreateBook();

  if (meLoading) {
    return (
      <div className="flex justify-center py-24 bg-white">
        <Spin />
      </div>
    );
  }
  if (!me || meErr) {
    return (
      <div className="p-10 bg-[#F6F1E8]">
        <Paragraph>
          请先 <Link to="/login">登录</Link> 后再发布书籍。
        </Paragraph>
      </div>
    );
  }

  const onFinish = async (v: FormVals) => {
    try {
      const payload = createBookInput.parse({
        title: v.title,
        author: v.author,
        isbn: v.isbn,
        description: v.description,
        conditionGrade: v.conditionGrade,
        coverImageKey: v.coverImageKey,
        imageKeys: v.imageKeys,
        priceCents: Math.round(v.priceYuan * 100),
      });
      const book = await create.mutateAsync(payload);
      message.success('已提交审核');
      navigate(`/books/${book.id}`);
    } catch (e) {
      if (e instanceof ApiError) message.error(e.message);
      else message.error('发布失败，请检查表单');
    }
  };

  return (
    <div className="bg-white min-h-[70vh]">
      <div className="max-w-xl mx-auto px-6 md:px-10 py-7 md:py-8 space-y-6">
        <Title level={3} className="font-display !text-[#1E3322] !mb-0">
          发布旧书
        </Title>
        <Paragraph type="secondary" className="!text-[#6B7B6B] !mb-0">
          提交后需管理员审核；请尽量上传实拍封面与准确 ISBN。
        </Paragraph>
        <Form form={form} layout="vertical" onFinish={onFinish} requiredMark={false} className="pt-2">
          <Form.Item name="title" label={<span className="text-[#1E3322]">书名</span>} rules={[{ required: true }]}>
            <Input maxLength={200} showCount className="!rounded" />
          </Form.Item>
          <Form.Item name="author" label="作者">
            <Input maxLength={100} />
          </Form.Item>
          <Form.Item name="isbn" label="ISBN">
            <Input placeholder="可选" />
          </Form.Item>
          <Form.Item name="priceYuan" label="价格（元）" rules={[{ required: true }]}>
            <InputNumber min={0} max={10000} precision={2} className="w-full" />
          </Form.Item>
          <Form.Item name="conditionGrade" label="成色" rules={[{ required: true }]}>
            <Select
              placeholder="选择成色"
              options={BOOK_CONDITIONS.map((c) => ({ value: c, label: BOOK_CONDITION_LABEL[c] }))}
            />
          </Form.Item>
          <Form.Item name="description" label="简介">
            <Input.TextArea rows={4} maxLength={2000} showCount />
          </Form.Item>
          <Form.Item label="封面" extra={<span className="text-[#6B7B6B]">JPEG / PNG / WebP，最大 5MB</span>}>
            <Upload
              maxCount={1}
              accept="image/jpeg,image/png,image/webp"
              beforeUpload={async (file) => {
                try {
                  const key = await uploadBookImage(file);
                  form.setFieldValue('coverImageKey', key);
                  message.success('封面上传成功');
                } catch {
                  message.error('上传失败');
                }
                return false;
              }}
              listType="picture"
            >
              <Button className="!border-[#D4CEC2]">选择图片</Button>
            </Upload>
          </Form.Item>
          <Form.Item name="coverImageKey" hidden>
            <Input />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={create.isPending} block size="large" className="!bg-[#2D6B3F]">
            提交审核
          </Button>
        </Form>
      </div>
    </div>
  );
}

export default Component;
