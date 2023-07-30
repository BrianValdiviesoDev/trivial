import { motion } from "framer-motion";
import styles from "../../styles/pages/Home.module.scss";
import { Trans } from "@lingui/react";
import { usePlayerDataStore } from "../../store/playerDataStore";
import { useGameDataStore } from "../../store/gameDataStore";
import TextButton from "../UI/TextButton";
import { useRef } from "react";
import { AvailableLanguages, LANGUAGES } from "../../utils/constans";

const LanguageNameStep: React.FC<{}> = () => {
  // Refs
  const selectRef = useRef<HTMLSelectElement>(null);

  // Store
  const { name, setName, language, setLanguage } = usePlayerDataStore();
  const { setCurrentStep } = useGameDataStore();

  return (
    <motion.div
      className={styles.container_presenter_inputs}
      initial={{ x: "100vw", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{
        x: "-100vw",
        opacity: 0,
      }}
      transition={{ duration: 0.5 }}
    >
      <img
        key="presenter"
        className={styles.container_presenter__image}
        src="/assets/cabraTrivial.png"
        alt=""
      />
      <Trans
        id="What's your name?"
        render={({ translation }) => (
          <input
            className={styles.input}
            type="text"
            onChange={(e) => setName(e.target.value)}
            placeholder={translation as string}
          />
        )}
      />
      <select
        ref={selectRef}
        className={styles.select}
        onChange={(e) => setLanguage(e.target.value as AvailableLanguages)}
        defaultValue={language}
      >
        <option value="" disabled>
          <Trans id="Select language" />
        </option>
        {LANGUAGES.map((language) => (
          <option key={language.code} value={language.code}>
            {language.name}
          </option>
        ))}
      </select>
      <TextButton
        action={() => setCurrentStep("selectTopic")}
        disabled={!name || !selectRef.current?.value}
      >
        <Trans id="Next" />
      </TextButton>
    </motion.div>
  );
};

export default LanguageNameStep;
