import type { UserRole, UserStatus } from '../constants/user';

export interface UserDTO {
  id: string;
  username: string | null;
  nickname: string;
  avatarUrl: string | null;
  bio: string | null;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
}

export type { UpdateProfileInput } from '../schemas/user';
