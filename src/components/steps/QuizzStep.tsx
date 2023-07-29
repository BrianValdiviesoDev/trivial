import { motion } from "framer-motion";
import styles from "../../styles/pages/Home.module.scss";
import { Question } from "../../services/openai.service";
import TextButton from "../UI/TextButton";

const QuizzStep: React.FC<{
  setUserResponse: React.Dispatch<React.SetStateAction<string | undefined>>;
  questions: Question[] | undefined;
  currentQuestion: number;
  isSpeaking: boolean;
  repeatAudio: () => Promise<void>;
}> = ({
  setUserResponse,
  questions,
  currentQuestion,
  isSpeaking,
  repeatAudio
}) => {
  // const questions: Question[] = [
  //   {
  //     question:
  //       "What is the capital of France What is the capital of France What is the capital of France?",
  //     options: [
  //       "Paris Paris Paris Paris ",
  //       "London",
  //       "Rome",
  //       "Madrid Madrid Madrid Madrid Madrid Madrid Madrid Madrid Madrid Madrid Madrid"
  //     ],
  //     answer: "Paris"
  //   } as Question
  // ];
  return (
    <motion.div
      className={styles.container_presenter_quizz}
      initial={{ x: "100vw", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{
        x: "-100vw",
        opacity: 0
      }}
      transition={{ duration: 0.5 }}
    >
      <div className={styles.container_presenter_quizz_question}>
        {questions && (
          <div className={styles.container_presenter_quizz_question_container}>
            <p
              className={
                styles.container_presenter_quizz_question_container__text
              }
            >
              {questions[currentQuestion].question}
            </p>
            <span
              className={
                styles.container_presenter_quizz_question_container__number
              }
            >
              {currentQuestion + 1}/{questions.length}
            </span>
          </div>
        )}
      </div>
      <img
        key="presenter"
        onClick={() => repeatAudio()}
        className={styles.container_presenter__image}
        src="/assets/cabraTrivial.png"
        alt=""
      />
      <div className={styles.container_presenter_quizz__options}>
        {questions && (
          <>
            {questions[currentQuestion].options.map((option, i) => (
              <TextButton
                key={i}
                disabled={isSpeaking}
                action={() => setUserResponse(option)}
              >
                {option}
              </TextButton>
            ))}
          </>
        )}
      </div>
    </motion.div>
  );
};

export default QuizzStep;
