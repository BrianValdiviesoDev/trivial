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
import { Trans } from "@lingui/react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useAppStatusStore } from "../store/appStatusStore";

const Home = () => {
  // Router
  const router = useRouter();

  // Refs
  const selectRef = useRef<HTMLSelectElement>(null);

  // Store
  const {
    name,
    setName,
    language,
    setLanguage,
    currentTopic,
    setCurrentTopic
  } = usePlayerDataStore();
  const { isAppLoading, setIsAppLoading } = useAppStatusStore();

  // Component states
  const { currentStep, setCurrentStep } = useGameDataStore();
  const [explainAudio, setExplainAudio] = useState<AudioBuffer>();
  const [questions, setQuestions] = useState<Question[]>();
  const [currentQuestion, setCurrentQuestion] = useState<number>(-1);
  const [userResponse, setUserResponse] = useState<string>();

  const audioFolder = "./assets";

  const prepareQuizz = async () => {
    console.log("Loading....");
    setIsAppLoading(true);
    const response = await getQuestions(currentTopic, language, 3);
    console.log(response);
    setQuestions(response);
    setCurrentQuestion(0);
    setIsAppLoading(false);
    setCurrentStep("quizz");
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
            {currentStep === "selectLanguage" && (
              <motion.div
                className={styles.container_presenter_inputs}
                initial={{ x: "-100vw", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{
                  x: "-100vw",
                  opacity: 0
                }}
                transition={{ duration: 0.5 }}
              >
                <Trans
                  id="¿Cómo te llamas?"
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
                  onChange={(e) =>
                    setLanguage(e.target.value as AvailableLanguages)
                  }
                >
                  <option value="" disabled>
                    <Trans id="Selecciona idioma" />
                  </option>
                  {LANGUAGES.map((language) => (
                    <option key={language.code} value={language.code}>
                      {language.name}
                    </option>
                  ))}
                </select>
                <TextButton
                  text="Siguiente"
                  action={() => setCurrentStep("selectTopic")}
                  disabled={!name || !selectRef.current?.value}
                />
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence mode="wait">
            {currentStep === "selectTopic" && (
              <motion.div
                className={styles.container_presenter_topics}
                initial={{ x: "100vw", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{
                  x: "100vw",
                  opacity: 0
                }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <Trans
                  id="¿Sobre qué tema quieres jugar?"
                  render={({ translation }) => (
                    <input
                      className={styles.input}
                      type="text"
                      onChange={(e) => setCurrentTopic(e.target.value)}
                      placeholder={translation as string}
                    />
                  )}
                />

                <TextButton text="Comenzar" action={prepareQuizz} />
                {/* <TextButton
                  text="Next"
                  action={() =>
                    setUserResponse("Aqui va el texto de la pregunta")
                  }
                /> */}
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence mode="wait">
            {currentStep === "quizz" && (
              <motion.div
                className={styles.container_presenter_quizz}
                initial={{ x: "100vw", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{
                  x: "100vw",
                  opacity: 0
                }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <div className={styles.container_presenter_quizz__question}>
                  {questions && (
                    <p
                      className={
                        styles.container_presenter_quizz__question__text
                      }
                    >
                      {questions[currentQuestion].question}
                    </p>
                  )}
                </div>
                <div className={styles.container_presenter_quizz__options}>
                  {questions && (
                    <>
                      {questions[currentQuestion].options.map((option, i) => (
                        <TextButton
                          key={i}
                          text={option}
                          action={() => setUserResponse(option)}
                        />
                      ))}
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </>
  );
};

export default Home;
