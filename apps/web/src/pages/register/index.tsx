import { Button, Form, Input, Typography, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { PASSWORD_MIN_LENGTH, registerInput, USERNAME_REGEX, type RegisterInput } from '@rebook/shared';
import { useRegister } from '@/features/auth/api';
import { ApiError } from '@/lib/api';
import { ERROR_CODES } from '@rebook/shared';

const { Title, Text } = Typography;

/** 【用户】02 注册 — rebook.pen W02 */
export function Component() {
  const [form] = Form.useForm<RegisterInput>();
  const reg = useRegister();
  const navigate = useNavigate();

  const onFinish = async (values: RegisterInput) => {
    try {
      const parsed = registerInput.parse(values);
      await reg.mutateAsync(parsed);
      message.success('注册成功');
      navigate('/');
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === ERROR_CODES.INVALID_INPUT && err.details && typeof err.details === 'object') {
          const d = err.details as { fieldErrors?: Record<string, string[]> };
          const first = Object.values(d.fieldErrors ?? {})[0]?.[0];
          message.error(first ?? err.message);
        } else message.error(err.message);
      } else message.error('注册失败');
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F1E8]">
      <div className="flex justify-between items-center px-8 md:px-[100px] pt-8 pb-2 text-[13px] max-w-[1200px] mx-auto">
        <Link to="/" className="text-[#2D6B3F] font-medium">
          ← 返回首页
        </Link>
        <Link to="/login" className="text-[#2D6B3F] font-semibold">
          去登录
        </Link>
      </div>
      <div className="max-w-[1200px] mx-auto px-8 md:px-[100px] py-10 md:py-14">
        <Title level={3} className="font-display !text-[#1E3322] !text-[28px] !mb-2">
          创建 ReBook 账号
        </Title>
        <Text className="text-[#6B7B6B] text-sm block mb-8 max-w-xl">
          注册后可在同校内买/卖、查单；成交将收取少量平台服务费（费率以平台公示为准）。
        </Text>
        <Form form={form} layout="vertical" onFinish={onFinish} className="max-w-md" requiredMark={false}>
          <Form.Item
            name="username"
            label="用户名"
            rules={[
              { required: true, message: '请输入用户名' },
              {
                pattern: USERNAME_REGEX,
                message: '3–32 位，仅英文字母、数字、下划线（与后端一致）',
              },
            ]}
          >
            <Input size="large" placeholder="例如 zhangsan_01" autoComplete="username" />
          </Form.Item>
          <Form.Item name="nickname" label="昵称（选填）">
            <Input size="large" placeholder="展示名，可不填" autoComplete="nickname" />
          </Form.Item>
          <Form.Item
            name="password"
            label="密码"
            rules={[
              { required: true, message: '请输入密码' },
              { min: PASSWORD_MIN_LENGTH, message: `至少 ${PASSWORD_MIN_LENGTH} 位` },
            ]}
          >
            <Input.Password size="large" autoComplete="new-password" />
          </Form.Item>
          <Text className="text-[#6B7B6B] text-xs block mb-4">
            已阅读并同意《用户协议》和《隐私政策》（示意文案）
          </Text>
          <Button
            type="primary"
            htmlType="submit"
            loading={reg.isPending}
            className="!min-w-[280px] !h-11 !bg-[#2D6B3F] !border-[#2D6B3F]"
          >
            注册
          </Button>
        </Form>
      </div>
    </div>
  );
}

export default Component;
