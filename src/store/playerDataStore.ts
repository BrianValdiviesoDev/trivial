import { create } from "zustand";
import { AvailableLanguages, AvailableTopics } from "../utils/constans";

type history = {
  topic: AvailableTopics;
  score: number;
};

interface PlayerDataStore {
  name: string;
  language: AvailableLanguages;
  setName: (name: string) => void;
  setLanguage: (language: AvailableLanguages) => void;
  currentScore: number;
  setCurrentScore: (score: number) => void;
  currentTopic: AvailableTopics;
  setCurrentTopic: (topic: AvailableTopics) => void;
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
  setCurrentTopic: (currentTopic: AvailableTopics) =>
    set(() => ({ currentTopic })),
  history: [],
  setHistory: (history: history[]) => set(() => ({ history }))
}));
