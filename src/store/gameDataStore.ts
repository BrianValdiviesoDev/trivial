import { create } from "zustand";

interface GameDataStore {
  currentStep: "selectLanguage" | "selectTopic" | "quizz" | "finish";
  setCurrentStep: (currentStep: GameDataStore["currentStep"]) => void;
}

export const useGameDataStore = create<GameDataStore>((set) => ({
  currentStep: "selectLanguage",
  setCurrentStep: (currentStep) => set({ currentStep })
}));
