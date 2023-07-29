import { motion } from "framer-motion";
import styles from "../../styles/pages/Home.module.scss";
import { Trans } from "@lingui/react";
import { usePlayerDataStore } from "../../store/playerDataStore";
import TextButton from "../UI/TextButton";
const TopicStep: React.FC<{
  prepareQuizz: () => Promise<void>;
  repeatAudio: () => Promise<void>;
}> = ({ prepareQuizz, repeatAudio }) => {
  // Store
  const { currentTopic, setCurrentTopic } = usePlayerDataStore();

  return (
    <motion.div
      className={styles.container_presenter_topics}
      initial={{ x: "100vw", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{
        x: "-100vw",
        opacity: 0
      }}
      transition={{ duration: 0.5 }}
    >
      <img
        key="presenter"
        onClick={() => repeatAudio()}
        className={styles.container_presenter__image}
        src="/assets/cabraTrivial.png"
        alt=""
      />
      <Trans
        id="What topic do you want to play?"
        render={({ translation }) => (
          <input
            className={styles.input}
            type="text"
            onChange={(e) => setCurrentTopic(e.target.value)}
            placeholder={translation as string}
          />
        )}
      />

      <TextButton action={prepareQuizz} disabled={!currentTopic}>
        <Trans id="Start" />
      </TextButton>
    </motion.div>
  );
};

export default TopicStep;
