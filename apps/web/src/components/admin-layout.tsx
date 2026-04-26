import { Layout, Menu, Tag } from 'antd';
import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import {
  HomeOutlined,
  NotificationOutlined,
  PercentageOutlined,
  ShoppingOutlined,
  UserOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { useMe } from '@/features/auth/api';

const { Header, Sider, Content } = Layout;

export function AdminLayout() {
  const location = useLocation();
  const { data: me, isLoading } = useMe();

  if (isLoading) return null;
  if (!me || (me.role !== 'admin' && me.role !== 'super_admin')) {
    return <Navigate to="/login" replace />;
  }

  const path = location.pathname;
  const selectedKey =
    ['/admin/pending-books', '/admin/disputes', '/admin/users', '/admin/fee', '/admin/announcements'].find(
      (k) => path === k || path.startsWith(`${k}/`),
    ) ?? '/admin/pending-books';

  const roleLabel = me.role === 'super_admin' ? '超级管理员' : '管理员';

  return (
    <Layout className="min-h-full">
      <Header className="!flex !h-14 !items-center !justify-between !bg-[#141A14] !px-4 md:!px-6 !leading-[56px]">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <Link
            to="/"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1.5 text-[13px] font-medium text-[#E4E0D4] no-underline transition-colors hover:bg-white/10 hover:text-white"
          >
            <HomeOutlined />
            返回主站
          </Link>
          <span className="hidden h-4 w-px bg-white/15 sm:block" aria-hidden />
          <span className="truncate font-display text-base font-semibold text-white">ReBook 管理后台</span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Tag className="!m-0 !border-[#2D6B3F]/50 !bg-[#2D6B3F]/20 !text-[#B8D4C0]">{roleLabel}</Tag>
          <span className="max-w-[8rem] truncate text-sm text-[#C8C4BC]">{me.nickname}</span>
        </div>
      </Header>
      <Layout>
        <Sider width={220} className="!min-h-[calc(100vh-56px)] !bg-[#141A14] !px-2 !pb-6 !pt-4">
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[selectedKey]}
            className="admin-sider-menu !border-0 !bg-transparent"
            items={[
              {
                key: '/admin/pending-books',
                icon: <ShoppingOutlined />,
                label: <Link to="/admin/pending-books">商品与待审</Link>,
              },
              {
                key: '/admin/disputes',
                icon: <WarningOutlined />,
                label: <Link to="/admin/disputes">纠纷仲裁</Link>,
              },
              {
                key: '/admin/users',
                icon: <UserOutlined />,
                label: <Link to="/admin/users">用户管理</Link>,
              },
              {
                key: '/admin/fee',
                icon: <PercentageOutlined />,
                label: <Link to="/admin/fee">平台费率</Link>,
              },
              {
                key: '/admin/announcements',
                icon: <NotificationOutlined />,
                label: <Link to="/admin/announcements">校园公告</Link>,
              },
            ]}
          />
        </Sider>
        <Content className="!min-h-[calc(100vh-56px)] !bg-[#F2EFE8] p-6 md:p-8">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
