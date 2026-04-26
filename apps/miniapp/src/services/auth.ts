import Taro from '@tarojs/taro';
import type { AuthResult, UserDTO } from '@rebook/shared';
import { api, setToken } from './request';

export async function loginWithWechat(opts?: {
  nickname?: string;
  avatarUrl?: string;
}): Promise<UserDTO> {
  const { code } = await Taro.login();
  const result = await api.post<AuthResult>('/auth/wx-login', { code, ...opts });
  setToken(result.token);
  return result.user;
}

export function logout(): void {
  setToken(null);
}

export async function fetchMe(): Promise<UserDTO> {
  return api.get<UserDTO>('/auth/me');
}
