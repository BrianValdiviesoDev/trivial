import "@/styles/globals.scss";
import type { AppProps } from "next/app";
import Layout from "../components/layout/Layout";
import { messages as esMessages } from "../../public/locales/es/messages";
import { messages as enMessages } from "../../public/locales/en/messages";
import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { useEffect } from "react";
import { usePlayerDataStore } from "../store/playerDataStore";

export default function App({ Component, pageProps }: AppProps) {
  // Store
  const { language } = usePlayerDataStore();

  // Lifecycle component
  // useEffect(() => {
  //   router.locale === "es" && i18n.load("es", esMessages);
  //   router.locale === "en" && i18n.load("en", enMessages);
  //   i18n.activate(router.locale as string);
  // }, [router.locale]);

  useEffect(() => {
    console.log("LANGUAGE: ", language);
    language === "es" && i18n.load("es", esMessages);
    language === "en" && i18n.load("en", enMessages);
    i18n.activate(language as string);
  }, [language]);

  console.log(language === "es");
  return (
    <I18nProvider i18n={i18n}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </I18nProvider>
  );
}
