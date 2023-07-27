export const LANGUAGES = [
  {
    name: "English",
    code: "en"
  },
  {
    name: "Español",
    code: "es"
  }
];

export type AvailableLanguages = (typeof LANGUAGES)[number]["code"];

export const TOPICS = [
  {
    name: "General Knowledge",
    code: "1"
  },
  {
    name: "Books",
    code: "2"
  },
  {
    name: "Film",
    code: "3"
  },
  {
    name: "Music",
    code: "4"
  },
  {
    name: "Musicals & Theatres",
    code: "5"
  },
  {
    name: "Television",
    code: "6"
  }
];

export type AvailableTopics = (typeof TOPICS)[number]["code"];
