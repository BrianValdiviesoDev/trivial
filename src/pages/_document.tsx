import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="preload" href="/assets/cabraTrivial.png" as="image" />
      </Head>

      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
