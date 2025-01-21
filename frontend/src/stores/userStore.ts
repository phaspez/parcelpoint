import { create } from "zustand";
import { AccountWithType } from "@/types/account";

interface UserState {
  user: AccountWithType | null;
  token: string | null;
  setUser: (newUser: AccountWithType) => void;
  setToken: (newToken: string) => void;
  clearUser: () => void;
  clearToken: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  token: null,
  setUser: (newUser) => set({ user: newUser }),
  clearUser: () => {
    set({ user: null });
  },
  setToken: (newToken) => set({ token: newToken }),
  clearToken: () => {
    set({ token: null });
  },
}));
