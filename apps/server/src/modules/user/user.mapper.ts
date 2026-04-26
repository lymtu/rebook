import type { UserDTO } from '@rebook/shared';
import type { UserRow } from '../../db/schema/users';

export function toUserDTO(row: UserRow): UserDTO {
  return {
    id: row.id,
    username: row.username,
    nickname: row.nickname,
    avatarUrl: row.avatarUrl,
    bio: row.bio,
    role: row.role,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
  };
}
