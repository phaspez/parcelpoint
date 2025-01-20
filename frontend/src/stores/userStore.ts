import { create } from "zustand";

interface UserState {
  user: AccountWithType | null;
  setUser: (newUser: AccountWithType) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (newUser) => set({ user: newUser }),
  clearUser: () => {
    set({ user: null });
  },
}));
