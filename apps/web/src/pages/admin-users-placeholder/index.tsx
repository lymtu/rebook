import { Button, Popconfirm, Space, Table, Tag, Typography, message } from 'antd';
import type { UserDTO } from '@rebook/shared';
import { useMe } from '@/features/auth/api';
import { useAdminUsers, usePromoteUser, useSetUserStatus } from '@/features/admin/api';
import { Link } from 'react-router-dom';

const ROLE_MAP: Record<string, string> = {
  user: '用户',
  admin: '管理员',
  super_admin: '超管',
};

/** 【管理】用户 — 列表 + 状态 + 超管升降权 */
export function Component() {
  const { data: me } = useMe();
  const { data, isLoading, refetch } = useAdminUsers();
  const setStatus = useSetUserStatus();
  const promote = usePromoteUser();
  const isSuper = me?.role === 'super_admin';

  const toggleBan = (u: UserDTO) => {
    const next = u.status === 'banned' ? 'active' : 'banned';
    void setStatus
      .mutateAsync({ id: u.id, input: { status: next } })
      .then(() => {
        message.success(next === 'banned' ? '已封禁' : '已解除封禁');
        void refetch();
      })
      .catch(() => message.error('操作失败'));
  };

  const columns = [
    {
      title: '昵称',
      dataIndex: 'nickname',
      key: 'nickname',
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      render: (v: string | null) => v ?? '—',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (r: string) => <Tag>{ROLE_MAP[r] ?? r}</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (s: string) => (
        <Tag color={s === 'banned' ? 'red' : 'green'}>{s === 'banned' ? '已封禁' : '正常'}</Tag>
      ),
    },
    {
      title: '注册时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 200,
      render: (t: string) => new Date(t).toLocaleString(),
    },
    {
      title: '操作',
      key: 'act',
      width: 220,
      render: (_: unknown, u: UserDTO) => (
        <Space wrap size="small">
          <Popconfirm
            title={u.status === 'banned' ? '确认解除封禁？' : '确认封禁该用户？'}
            onConfirm={() => toggleBan(u)}
            disabled={u.id === me?.id}
          >
            <Button type="link" size="small" danger={u.status !== 'banned'} disabled={u.id === me?.id}>
              {u.status === 'banned' ? '解封' : '封禁'}
            </Button>
          </Popconfirm>
          {isSuper && u.role === 'user' && (
            <Popconfirm title="授予管理员权限？" onConfirm={() => void runPromote(u.id, 'admin')}>
              <Button type="link" size="small" className="!text-[#2D6B3F]">
                设为管理员
              </Button>
            </Popconfirm>
          )}
          {isSuper && u.role === 'admin' && (
            <Popconfirm title="降为普通用户？" onConfirm={() => void runPromote(u.id, 'user')}>
              <Button type="link" size="small">
                降为用户
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  function runPromote(userId: string, role: 'admin' | 'user') {
    void promote
      .mutateAsync({ userId, role })
      .then(() => {
        message.success('已更新角色');
        void refetch();
      })
      .catch(() => message.error('操作失败'));
  }

  return (
    <div className="space-y-4">
      <Typography.Title level={4} className="font-display !mb-1 !text-[#1E3322]">
        用户管理
      </Typography.Title>
      <Typography.Paragraph className="!mb-0 !text-sm !text-[#4A5A4A]">
        封禁后用户无法登录；管理员不能封禁其它管理员或超管（由接口校验）。超管可授予/撤销管理员。
      </Typography.Paragraph>
      <div className="rounded-xl border border-[#D4CEC2] bg-white p-4 shadow-sm">
        <Table<UserDTO> rowKey="id" loading={isLoading} dataSource={data?.items} columns={columns} pagination={false} />
      </div>
      <Typography.Paragraph type="secondary" className="!text-xs !mb-0">
        需要按用户名精确查找时，可先在 <Link to="/admin/pending-books">待审</Link> 等页面复制用户 ID。
      </Typography.Paragraph>
    </div>
  );
}

export default Component;
