/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  i18n: {
    locales: ["es", "en"],
    defaultLocale: "es"
  },
  env: {
    NEXT_PUBLIC_OPENAI_API_KEY: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    NEXT_PUBLIC_ELEVENLABS_API_KEY: process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY,
    NEXT_PUBLIC_PRESENTER_VOICEID: process.env.NEXT_PUBLIC_PRESENTER_VOICEID
  }
};

module.exports = nextConfig;
