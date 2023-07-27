import { create } from "zustand";

interface GameDataStore {
  currentStep: number;
  setCurrentStep: (currentStep: number) => void;
}

export const useGameDataStore = create<GameDataStore>((set) => ({
  currentStep: 0,
  setCurrentStep: (currentStep: number) => set(() => ({ currentStep }))
}));
