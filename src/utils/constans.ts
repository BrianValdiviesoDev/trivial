export const LANGUAGES = [
  {
    name: "English",
    code: "en"
  },
  {
    name: "Spanish",
    code: "es"
  }
];

export type AvailableLanguages = (typeof LANGUAGES)[number]["code"];