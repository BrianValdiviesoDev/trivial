/** @type {import('@lingui/conf').LinguiConfig} */
module.exports = {
  catalogs: [
    {
      "path": "public/locales/{locale}/messages",
      "include": ["src/**/*.{js,jsx,ts,tsx}"]
    }
  ],
  locales: ["es", "en"],
  format: "po",
  sourceLocale: "es"
};
