import type { UserDTO } from './user';
export type { LoginInput, RegisterInput, WxLoginInput } from '../schemas/auth';

export interface AuthResult {
  token: string;
  user: UserDTO;
}
