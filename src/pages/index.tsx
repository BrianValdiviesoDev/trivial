import Head from "next/head";
import styles from "@/styles/pages/Home.module.scss";

import { AvailableLanguages, LANGUAGES } from "../utils/constans";
import { usePlayerDataStore } from "../store/playerDataStore";
import { useGameDataStore } from "../store/gameDataStore";
import TextButton from "../components/UI/TextButton";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Question, getModels, getQuestions } from "@/services/openai.service";
import { tts } from "@/services/elevenLabs.service";

const Home = () => {
  // Refs
  const selectRef = useRef<HTMLSelectElement>(null);

  // Store
  const {
    name,
    setName,
    language,
    setLanguage,
    currentTopic,
    setCurrentTopic,
  } = usePlayerDataStore();
  const { currentStep, setCurrentStep } = useGameDataStore();
  const [explainAudio, setExplainAudio] = useState<AudioBuffer>();
  const [questions, setQuestions] = useState<Question[]>();
  const [currentQuestion, setCurrentQuestion] = useState<number>(-1);
  const [userResponse, setUserResponse] = useState<string>();
  const [loading, setLoading] = useState<boolean>(false);

  const audioFolder = "./assets";

  const prepareQuizz = async () => {
    console.log("Loading....");
    setLoading(true);
    const response = await getQuestions(currentTopic, language, 3);
    console.log(response);
    setQuestions(response);
    setCurrentQuestion(0);
    setLoading(false);
  };

  const generateResponsesAudios = async (
    responses: string[],
    language: string
  ): Promise<AudioBuffer> => {
    const indexes = ["a", "b", "c", "d", "e", "f", "g"];
    const newResponses = await Promise.all(
      responses.map(async (r, i) => {
        return `${indexes[i]}.
          ${r}
          .
          .`;
      })
    );
    console.log("RESPONSES: ", responses, newResponses, newResponses.join("."));
    const audio = await tts(newResponses.join("."), language);
    return audio;
  };
  const getNextQuestion = async () => {
    setUserResponse("");
    if (questions) {
      const question = questions[currentQuestion];
      console.log("QUIZZ: ", questions);

      const questionAudio = await tts(question.question, language);
      await playAudio(questionAudio);

      const responsesAudio = await generateResponsesAudios(
        question.options,
        language
      );
      await playAudio(responsesAudio);

      const explainAudio = await tts(question.explain, language);
      setExplainAudio(explainAudio);
    }
  };
  const playAudio = async (audio: AudioBuffer) => {
    await new Promise<void>((resolve) => {
      const audioContext = new window.AudioContext();
      const sourceNode = audioContext.createBufferSource();
      sourceNode.buffer = audio;
      sourceNode.connect(audioContext.destination);
      sourceNode.start();
      sourceNode.onended = () => resolve();
    });
  };

  const playFile = async (url: string) => {
    const audio = new Audio(url);
    const audioContext = new window.AudioContext();
    const sourceNode = audioContext.createMediaElementSource(audio);
    sourceNode.connect(audioContext.destination);
    audio.play();
  };

  useEffect(() => {
    if (!questions || userResponse === "") {
      return;
    }

    if (currentQuestion > questions?.length) {
      finishQuizz();
      return;
    }
    const languageCode =
      LANGUAGES.find((l) => l.name === language)?.code || "en";

    if (userResponse === questions[currentQuestion].answer) {
      playFile(`${audioFolder}/correct_${languageCode}.mp3`);
    } else {
      playFile(`${audioFolder}/error_${languageCode}.mp3`);
    }
    setCurrentQuestion(currentQuestion + 1);
  }, [userResponse]);

  const finishQuizz = () => {
    //TODO create finish screen with resume
    console.log("FINISH");
  };

  useEffect(() => {
    console.log("CURREN QUESTION;: ", currentQuestion, questions?.length);
    if (questions) {
      if (currentQuestion > questions?.length - 1) {
        console.log("finish quizz");
        finishQuizz();
      } else if (currentQuestion > -1) {
        getNextQuestion();
      }
    }
  }, [currentQuestion]);

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
            src="/assets/cabraTrivial.png"
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
                  top: "50%",
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
                <input
                  className={styles.input}
                  type="text"
                  onChange={(e) => setCurrentTopic(e.target.value)}
                />
                <TextButton text="Start" action={prepareQuizz} />
                <TextButton
                  text="Next"
                  action={() =>
                    setUserResponse("Aqui va el texto de la pregunta")
                  }
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </>
  );
};

export default Home;
