import { motion } from "framer-motion";
import styles from "../../styles/pages/Home.module.scss";
import { Trans } from "@lingui/react";
import { usePlayerDataStore } from "../../store/playerDataStore";
import { Question } from "../../services/openai.service";
import TextButton from "../UI/TextButton";
import { useGameDataStore } from "../../store/gameDataStore";

const FinishStep: React.FC<{
  questions: Question[] | undefined;
}> = ({ questions }) => {
  // Store
  const { currentScore, history } = usePlayerDataStore();
  const { setCurrentStep } = useGameDataStore();

  return (
    <motion.div
      className={styles.container_presenter_finish}
      initial={{ x: "100vw", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{
        x: "-100vw",
        opacity: 0
      }}
      transition={{ duration: 0.5 }}
    >
      <img
        className={styles.container_presenter_finish__image}
        src="/assets/trofeo.png"
        alt=""
      />
      <div className={styles.container_presenter_finish__gameOver}>
        <p>
          <Trans id="Game Over!" />
        </p>
        <p>
          <Trans id="You got" />
          {` ${currentScore} / ${questions?.length}`}
        </p>
        <p>
          <Trans id="Total points" /> {` ${currentScore} pts`}
        </p>
      </div>
      <motion.div
        className={styles.container_presenter_finish__stats}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        {history && history.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>
                  <Trans id="Topic" />
                </th>
                <th>
                  <Trans id="Score" />
                </th>
              </tr>
            </thead>
            <tbody>
              {history.map((item, index) => (
                <tr key={index}>
                  <td>{item.topic}</td>
                  <td>{item.score} pts</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </motion.div>
      <TextButton
        action={() => {
          setCurrentStep("selectTopic");
        }}
      >
        <Trans id="Select new topic" />
      </TextButton>
    </motion.div>
  );
};

export default FinishStep;
