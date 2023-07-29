import { create } from "zustand";
import { AvailableLanguages } from "../utils/constans";

type history = {
  topic: string;
  score: number;
};

interface PlayerDataStore {
  name: string;
  language: AvailableLanguages;
  setName: (name: string) => void;
  setLanguage: (language: AvailableLanguages) => void;
  currentScore: number;
  setCurrentScore: (score: number) => void;
  currentTopic: string;
  setCurrentTopic: (topic: string) => void;
  history: history[];
  setHistory: (history: history[]) => void;
}

export const usePlayerDataStore = create<PlayerDataStore>((set) => ({
  name: "",
  language: "en",
  setName: (name: string) => set(() => ({ name })),
  setLanguage: (language: AvailableLanguages) => set(() => ({ language })),
  currentScore: 0,
  setCurrentScore: (currentScore: number) => set(() => ({ currentScore })),
  currentTopic: "",
  setCurrentTopic: (currentTopic: string) => set(() => ({ currentTopic })),
  history: [],
  setHistory: (history: history[]) => set(() => ({ history }))
}));
