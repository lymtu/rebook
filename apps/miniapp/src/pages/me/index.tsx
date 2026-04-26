import { useState } from 'react';
import { View, Text } from '@tarojs/components';
import { Button, Cell, Toast } from '@nutui/nutui-react-taro';
import type { UserDTO } from '@rebook/shared';
import { fetchMe, loginWithWechat, logout } from '@/services/auth';
import { useAuthStore } from '@/stores/auth';

export default function MePage() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const u = await loginWithWechat();
      setUser(u);
    } catch (err) {
      setToast(err instanceof Error ? err.message : '登录失败');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    setUser(null);
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const u: UserDTO = await fetchMe();
      setUser(u);
    } catch (err) {
      setToast(err instanceof Error ? err.message : '获取失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="page" style={{ padding: '24rpx' }}>
      {user ? (
        <>
          <Cell title="昵称" extra={user.nickname} />
          <Cell title="角色" extra={user.role} />
          <Cell title="ID" extra={user.id} />
          <View style={{ marginTop: '32rpx', display: 'flex', gap: '16rpx' }}>
            <Button type="primary" loading={loading} onClick={handleRefresh}>
              刷新
            </Button>
            <Button onClick={handleLogout}>退出登录</Button>
          </View>
        </>
      ) : (
        <View>
          <Text>未登录</Text>
          <View style={{ marginTop: '24rpx' }}>
            <Button type="primary" loading={loading} onClick={handleLogin}>
              微信一键登录
            </Button>
          </View>
        </View>
      )}
      <Toast visible={!!toast} content={toast ?? ''} onClose={() => setToast(null)} />
    </View>
  );
}
