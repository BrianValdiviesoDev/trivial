import { create } from "zustand";

interface AppStatusStore {
  isAppLoading: boolean;
  setIsAppLoading: (isLoading: boolean) => void;
}

export const useAppStatusStore = create<AppStatusStore>((set) => ({
  isAppLoading: false,
  setIsAppLoading: (isLoading) => set({ isAppLoading: isLoading })
}));
