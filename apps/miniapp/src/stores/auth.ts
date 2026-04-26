import { create } from 'zustand';
import type { UserDTO } from '@rebook/shared';

interface AuthStore {
  user: UserDTO | null;
  setUser: (user: UserDTO | null) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clear: () => set({ user: null }),
}));
