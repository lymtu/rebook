import { Badge, Button, Dropdown, Layout } from 'antd';
import type { MenuProps } from 'antd';
import {
  LogoutOutlined,
  ShoppingCartOutlined,
  UnorderedListOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useMe, useLogout } from '@/features/auth/api';
import { useCart } from '@/features/cart/api';

const { Header, Content, Footer } = Layout;

export function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: me, isLoading: meLoading } = useMe();
  const { data: cartLines } = useCart(!meLoading && Boolean(me));
  const logout = useLogout();
  const cartCount = me ? (cartLines?.length ?? 0) : 0;

  const path = location.pathname;
  const navActive = (prefix: string) => path === prefix || (prefix !== '/' && path.startsWith(prefix));

  const userMenu: MenuProps['items'] = [
    { key: 'orders', icon: <UnorderedListOutlined />, label: <Link to="/orders">买卖记录</Link> },
    { key: 'my-books', label: <Link to="/my-books">我的书籍</Link> },
    { type: 'divider' },
    {
      key: 'out',
      icon: <LogoutOutlined />,
      label: '登出',
      onClick: () => {
        void logout.mutateAsync().then(() => navigate('/'));
      },
    },
  ];

  return (
    <Layout className="min-h-full !bg-[#E4DDD2]">
      <Header className="!h-[68px] !leading-[68px] !px-6 md:!px-10 !bg-[#FAFAF7]/95 !backdrop-blur-sm !border-b !border-[#E5E0D6]/90 flex items-center justify-between shadow-[0_1px_0_rgba(30,51,34,0.06)]">
        <div className="flex items-center gap-6 md:gap-10 min-w-0 flex-1">
          <Link
            to="/"
            className="font-display text-[#1E3322] text-lg md:text-[1.35rem] font-semibold shrink-0 whitespace-nowrap tracking-tight hover:opacity-90 transition-opacity"
          >
            ReBook 校园换书
          </Link>
          <nav className="hidden sm:flex items-center gap-1 md:gap-2 text-[15px]">
            <Link
              to="/"
              className={`rounded-md px-2.5 py-1.5 no-underline transition-colors ${
                navActive('/') && path === '/'
                  ? 'text-[#2D6B3F] font-semibold bg-[#2D6B3F]/[0.08]'
                  : 'text-[#1E3322]/90 font-normal hover:text-[#2D6B3F] hover:bg-[#1E3322]/[0.04]'
              }`}
            >
              发现
            </Link>
            <Link
              to="/categories"
              className={`rounded-md px-2.5 py-1.5 no-underline transition-colors ${
                navActive('/categories')
                  ? 'text-[#2D6B3F] font-semibold bg-[#2D6B3F]/[0.08]'
                  : 'text-[#1E3322]/90 hover:text-[#2D6B3F] hover:bg-[#1E3322]/[0.04]'
              }`}
            >
              分类
            </Link>
            <Link
              to="/messages"
              className={`rounded-md px-2.5 py-1.5 no-underline transition-colors ${
                navActive('/messages')
                  ? 'text-[#2D6B3F] font-semibold bg-[#2D6B3F]/[0.08]'
                  : 'text-[#1E3322]/90 hover:text-[#2D6B3F] hover:bg-[#1E3322]/[0.04]'
              }`}
            >
              消息
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3 md:gap-4 shrink-0">
          {me && (
            <Link to="/cart" className="text-[#1E3322] hidden sm:inline-flex sm:items-center">
              <Badge count={cartCount} size="small" offset={[4, 0]}>
                <span className="inline-flex items-center gap-1 text-sm">
                  <ShoppingCartOutlined className="text-lg" />
                  <span className="hidden md:inline">购物车</span>
                </span>
              </Badge>
            </Link>
          )}
          <Link to="/sell">
            <Button type="primary" size="middle" className="!bg-[#2D6B3F] !border-[#2D6B3F] !h-10 !px-5 !font-medium !shadow-none hover:!brightness-[1.05]">
              发布旧书
            </Button>
          </Link>
          {meLoading ? null : me ? (
            <>
              <Link to="/orders" className="text-[#2D6B3F] text-sm font-medium hidden md:inline">
                买卖记录
              </Link>
              {(me.role === 'admin' || me.role === 'super_admin') && (
                <Link to="/admin/pending-books" className="text-[#2D6B3F] text-sm font-medium hidden lg:inline">
                  管理后台
                </Link>
              )}
              <Dropdown menu={{ items: userMenu }} placement="bottomRight" trigger={['click']}>
                <button
                  type="button"
                  className="flex items-center gap-1.5 text-[#1E3322] text-sm font-medium bg-[#1E3322]/[0.04] hover:bg-[#1E3322]/[0.07] rounded-lg px-2 py-1 border-0 cursor-pointer max-w-[7rem] truncate transition-colors"
                >
                  <UserOutlined className="text-[#2D6B3F]" />
                  {me.nickname}
                </button>
              </Dropdown>
            </>
          ) : (
            <span className="space-x-3 text-sm">
              <Link to="/login" className="text-[#2D6B3F] font-medium">
                登录
              </Link>
              <Link to="/register" className="text-[#6B6B6B]">
                注册
              </Link>
            </span>
          )}
        </div>
      </Header>
      <Content className="!bg-[#E4DDD2] px-4 md:px-8 py-6 md:py-8">
        <div className="rebook-main-surface mx-auto max-w-[1200px] rounded-xl border border-[#D4CFC2]/90 bg-[#F6F1E8] min-h-[calc(100vh-68px-80px)] overflow-hidden">
          <Outlet />
        </div>
      </Content>
      <Footer className="!bg-[#E4DDD2] text-center text-[#6B7B6B] text-xs border-0">
        ReBook 校园二手书 · 线下面交 · © {new Date().getFullYear()}
      </Footer>
    </Layout>
  );
}
