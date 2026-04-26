import { Button, Form, Input, Typography, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { loginInput, PASSWORD_MIN_LENGTH, USERNAME_REGEX, type LoginInput } from '@rebook/shared';
import { useLogin } from '@/features/auth/api';
import { ApiError } from '@/lib/api';

const { Title, Text } = Typography;

/** 【用户】01 登录 — layout from rebook.pen W01 */
export function Component() {
  const [form] = Form.useForm<LoginInput>();
  const login = useLogin();
  const navigate = useNavigate();

  const onFinish = async (values: LoginInput) => {
    try {
      const parsed = loginInput.parse(values);
      await login.mutateAsync(parsed);
      message.success('登录成功');
      navigate('/');
    } catch (err) {
      if (err instanceof ApiError) message.error(err.message);
      else message.error('登录失败');
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden md:flex w-[420px] shrink-0 bg-[#1E3322] flex-col justify-center px-12 text-white">
        <Title level={2} className="!text-white !font-normal font-display !text-[32px] !mb-4 !mt-0">
          ReBook 换书
        </Title>
        <Text className="!text-white/90 text-[15px] leading-relaxed block max-w-[300px]">
          校园二手书 · 线下面交 · 平台收取少额成交费
        </Text>
      </div>
      <div className="flex-1 flex flex-col bg-[#F6F1E8] min-h-screen">
        <div className="flex justify-between items-center px-8 md:px-16 pt-8 pb-2 text-[13px]">
          <Link to="/" className="text-[#2D6B3F] font-medium">
            ← 返回首页
          </Link>
          <Link to="/register" className="text-[#2D6B3F] font-semibold">
            去注册
          </Link>
        </div>
        <div className="flex-1 flex flex-col px-8 md:px-16 py-10 max-w-[780px] w-full mx-auto">
          <Title level={3} className="font-display !text-[#1E3322] !text-[28px] !mb-2 !mt-0">
            欢迎回来
          </Title>
          <Text className="text-[#6B7B6B] text-sm block mb-6">使用用户名登录（手机号或邮箱能力可后续接入）</Text>
          <Form form={form} layout="vertical" onFinish={onFinish} className="max-w-md" requiredMark={false}>
            <Form.Item
              name="username"
              label={<span className="text-[#1E3322]">账号</span>}
              rules={[
                { required: true, message: '请输入用户名' },
                {
                  pattern: USERNAME_REGEX,
                  message: '3–32 位，仅字母、数字、下划线',
                },
              ]}
            >
              <Input size="large" autoComplete="username" className="!rounded" />
            </Form.Item>
            <Form.Item
              name="password"
              label={<span className="text-[#1E3322]">密码</span>}
              rules={[
                { required: true, message: '请输入密码' },
                { min: PASSWORD_MIN_LENGTH, message: `至少 ${PASSWORD_MIN_LENGTH} 位` },
              ]}
            >
              <Input.Password size="large" autoComplete="current-password" className="!rounded" />
            </Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={login.isPending}
              className="!h-12 !bg-[#2D6B3F] !border-[#2D6B3F]"
            >
              登录
            </Button>
          </Form>
          <div className="mt-5 max-w-md">
            <Button block size="large" className="!h-[46px] !bg-white !border-[#D4CEC2] text-[#1E3322]">
              微信登录（小程序端）
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Component;
