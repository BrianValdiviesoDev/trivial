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
