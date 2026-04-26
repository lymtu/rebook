import {
  Button,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  Spin,
  Typography,
  Upload,
  message,
} from 'antd';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import {
  BOOK_CONDITIONS,
  BOOK_CONDITION_LABEL,
  updateBookInput,
} from '@rebook/shared';
import type { UpdateBookInput } from '@rebook/shared';
import { useMe } from '@/features/auth/api';
import { useBook, useUpdateBook } from '@/features/book/api';
import { uploadBookImage } from '@/features/upload/api';
import { ApiError } from '@/lib/api';
const { Title, Paragraph } = Typography;

type FormVals = Omit<UpdateBookInput, 'priceCents'> & { priceYuan?: number };

export function Component() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: me, isLoading: meLoading, isError: meErr } = useMe();
  const { data: book, isLoading } = useBook(id);
  const [form] = Form.useForm<FormVals>();
  const update = useUpdateBook(id ?? '');

  useEffect(() => {
    if (!book) return;
    form.setFieldsValue({
      title: book.title,
      author: book.author ?? undefined,
      isbn: book.isbn ?? undefined,
      description: book.description ?? undefined,
      conditionGrade: book.conditionGrade,
      coverImageKey: book.coverImageKey ?? undefined,
      priceYuan: book.priceCents / 100,
    });
  }, [book, form]);

  if (meLoading || isLoading || !id) {
    return (
      <div className="flex justify-center py-24">
        <Spin size="large" />
      </div>
    );
  }
  if (!me || meErr || !book) {
    return <Paragraph>无法加载。</Paragraph>;
  }
  if (book.sellerId !== me.id) {
    return <Paragraph>只能编辑自己的书籍。</Paragraph>;
  }

  const onFinish = async (v: FormVals) => {
    try {
      const payload = updateBookInput.parse({
        title: v.title,
        author: v.author,
        isbn: v.isbn,
        description: v.description,
        conditionGrade: v.conditionGrade,
        coverImageKey: v.coverImageKey,
        imageKeys: v.imageKeys,
        priceCents:
          v.priceYuan !== undefined ? Math.round(v.priceYuan * 100) : undefined,
      });
      await update.mutateAsync(payload);
      message.success('已保存');
      navigate(`/books/${id}`);
    } catch (e) {
      if (e instanceof ApiError) message.error(e.message);
      else message.error('保存失败');
    }
  };

  return (
    <div className="max-w-xl mx-auto px-6 md:px-10 py-8 bg-[#F6F1E8] min-h-[70vh]">
      <Title level={3} className="font-display !text-[#1E3322]">
        编辑书籍
      </Title>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item name="title" label="书名" rules={[{ required: true }]}>
          <Input maxLength={200} showCount />
        </Form.Item>
        <Form.Item name="author" label="作者">
          <Input maxLength={100} />
        </Form.Item>
        <Form.Item name="isbn" label="ISBN">
          <Input />
        </Form.Item>
        <Form.Item name="priceYuan" label="价格（元）" rules={[{ required: true }]}>
          <InputNumber min={0} max={10000} precision={2} className="w-full" />
        </Form.Item>
        <Form.Item name="conditionGrade" label="成色" rules={[{ required: true }]}>
          <Select
            options={BOOK_CONDITIONS.map((c) => ({ value: c, label: BOOK_CONDITION_LABEL[c] }))}
          />
        </Form.Item>
        <Form.Item name="description" label="简介">
          <Input.TextArea rows={4} maxLength={2000} showCount />
        </Form.Item>
        <Form.Item label="封面">
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
            <Button>更换封面</Button>
          </Upload>
        </Form.Item>
        <Form.Item name="coverImageKey" hidden>
          <Input />
        </Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={update.isPending} className="!bg-[#2D6B3F]">
            保存
          </Button>
          <Link to={`/books/${id}`}>
            <Button>取消</Button>
          </Link>
        </Space>
      </Form>
    </div>
  );
}

export default Component;
