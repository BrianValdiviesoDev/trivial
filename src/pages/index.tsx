import Head from "next/head";
import styles from "@/styles/pages/Home.module.scss";

import { AvailableLanguages, LANGUAGES, TOPICS } from "../utils/constans";
import { usePlayerDataStore } from "../store/playerDataStore";
import { useGameDataStore } from "../store/gameDataStore";
import TextButton from "../components/UI/TextButton";
import { useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";

const Home = () => {
  // Refs
  const selectRef = useRef<HTMLSelectElement>(null);
  // Store
  const { name, setName, language, setLanguage } = usePlayerDataStore();
  const { currentStep, setCurrentStep } = useGameDataStore();

  return (
    <>
      <Head>
        <title>Trivial</title>
        <meta name="description" content="A funny quiz game AI based" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <section className={styles.container}>
        <div className={styles.container_presenter}>
          <img
            className={styles.container_presenter__image}
            src="/assets/cabra_falsa.png"
            alt=""
          />
          <AnimatePresence mode="wait">
            {currentStep === 0 && (
              <motion.div
                className={styles.container_presenter_inputs}
                initial={{ x: "-100vw", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{
                  x: "-100vw",
                  opacity: 0,
                  position: "absolute",
                  top: "50%"
                }}
                transition={{ duration: 0.5 }}
              >
                <input
                  className={styles.input}
                  type="text"
                  onChange={(e) => setName(e.target.value)}
                />
                <select
                  ref={selectRef}
                  className={styles.select}
                  onChange={(e) =>
                    setLanguage(e.target.value as AvailableLanguages)
                  }
                >
                  <option value="">Language select</option>
                  {LANGUAGES.map((language) => (
                    <option key={language.code} value={language.code}>
                      {language.name}
                    </option>
                  ))}
                </select>
                <TextButton
                  text="Next"
                  action={() => setCurrentStep(currentStep + 1)}
                  disabled={!name || !selectRef.current?.value}
                />
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                className={styles.container_presenter_topics}
                initial={{ x: "100vw", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: "100vw", opacity: 0, position: "absolute" }}
                transition={{ duration: 0.5 }}
              >
                <select
                  ref={selectRef}
                  className={styles.select}
                  onChange={(e) =>
                    setLanguage(e.target.value as AvailableLanguages)
                  }
                >
                  <option value="">What topic do you want to test?</option>
                  {TOPICS.map((topic) => (
                    <option key={topic.code} value={topic.code}>
                      {topic.name}
                    </option>
                  ))}
                </select>
                <TextButton text="Start" action={() => null} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </>
  );
};

export default Home;
