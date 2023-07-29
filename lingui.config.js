/** @type {import('@lingui/conf').LinguiConfig} */
module.exports = {
  catalogs: [
    {
      "path": "public/locales/{locale}/messages",
      "include": ["src/pages/**/*", "src/components/**/*"]
    }
  ],
  locales: ["en", "es"],
  format: "po",
  sourceLocale: "en"
};
