import Head from "next/head";
import styles from "@/styles/pages/Home.module.scss";

import { AvailableLanguages, LANGUAGES } from "../utils/constans";
import { usePlayerDataStore } from "../store/playerDataStore";
import { useGameDataStore } from "../store/gameDataStore";
import TextButton from "../components/UI/TextButton";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Question, getModels, getQuestions } from "@/services/openai.service";
import { Trans } from "@lingui/react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useAppStatusStore } from "../store/appStatusStore";
import { getVoices, tts } from "@/services/elevenLabs.service";

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
    setCurrentTopic,
  } = usePlayerDataStore();
  const { isAppLoading, setIsAppLoading } = useAppStatusStore();

  // Component states
  const { currentStep, setCurrentStep } = useGameDataStore();
  const [questions, setQuestions] = useState<Question[]>();
  const [currentQuestion, setCurrentQuestion] = useState<number>(-1);
  const [questionAudio, setQuestionAudio] = useState<AudioBuffer>();
  const [answersAudio, setAnswersAudio] = useState<AudioBuffer>();
  const [explainAudio, setExplainAudio] = useState<AudioBuffer>();
  const [userResponse, setUserResponse] = useState<string>();
  const [voiceId, setVoiceId] = useState<string>("");
  const [error, setError] = useState<string | null>();
  const [points, setPoints] = useState<number>(0);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const audioFolder = "./assets";

  const prepareQuizz = async () => {
    setIsAppLoading(true);
    try {
      const response = await getQuestions(currentTopic, language, 1);
      setQuestions(response);
      setCurrentQuestion(0);
      setCurrentStep("quizz");
    } catch (e) {
      setError("OpenAI error");
    }
    setIsAppLoading(false);
  };
  const generateResponsesAudios = async (
    responses: string[],
    language: string
  ): Promise<AudioBuffer> => {
    const indexes = [
      {
        language: "es",
        indexes: [
          "Respuesta a",
          "Respuesta b",
          "Respuesta c",
          "Respuesta d",
          "Respuesta e",
          "Respuesta f",
          "Respuesta g",
        ],
      },
      {
        language: "en",
        indexes: [
          "Answer a",
          "Answer b",
          "Answer c",
          "Answer d",
          "Answer e",
          "Answer f",
          "Answer g",
        ],
      },
    ];

    const preAnswers = indexes.find((l) => l.language === language);
    const newResponses = await Promise.all(
      responses.map(async (r, i) => {
        return `${preAnswers?.indexes[i]}.
          ${r}
          .
          .`;
      })
    );
    const audio = await tts(newResponses.join("."), language, voiceId);
    return audio;
  };
  const getNextQuestion = async () => {
    setUserResponse("");

    if (questions && voiceId) {
      setIsAppLoading(true);
      const question = questions[currentQuestion];

      const questionAudio = await tts(question.question, language, voiceId);
      setQuestionAudio(questionAudio);
      const responsesAudio = await generateResponsesAudios(
        question.options,
        language
      );
      setAnswersAudio(responsesAudio);

      const explainAudio = await tts(question.explain, language, voiceId);
      setExplainAudio(explainAudio);
      setIsAppLoading(false);

      await playAudio(questionAudio);
      await playAudio(responsesAudio);
    } else {
      setCurrentStep("selectTopic");
    }
  };
  const repeatAudio = async () => {
    if (questionAudio) {
      await playAudio(questionAudio);
    }

    if (answersAudio) {
      await playAudio(answersAudio);
    }
  };
  const playAudio = async (audio: AudioBuffer) => {
    if (isSpeaking) {
      return;
    }
    setIsSpeaking(true);
    await new Promise<void>((resolve) => {
      const audioContext = new window.AudioContext();
      const sourceNode = audioContext.createBufferSource();
      sourceNode.buffer = audio;
      sourceNode.connect(audioContext.destination);
      sourceNode.start();
      sourceNode.onended = () => resolve();
    });
    setIsSpeaking(false);
  };
  const playFile = async (url: string) => {
    if (isSpeaking) {
      return;
    }
    setIsSpeaking(true);
    await new Promise<void>((resolve) => {
      const audio = new Audio(url);
      const audioContext = new window.AudioContext();
      const sourceNode = audioContext.createMediaElementSource(audio);
      sourceNode.connect(audioContext.destination);
      audio.play();
      audio.onended = () => resolve();
    });
    setIsSpeaking(false);
  };
  const finishQuizz = () => {
    //TODO store quizz results
    setCurrentStep("finish");
  };
  const getPresenterVoice = async () => {
    const voices = await getVoices();
    const presenterVoice = voices.find((v) => v.name === "CABRA").voice_id;
    setVoiceId(presenterVoice);
  };
  const checkAnswer = async () => {
    if (questions && userResponse !== "") {
      const languageCode =
        LANGUAGES.find((l) => l.code === language)?.code || "en";
      if (userResponse === questions[currentQuestion].answer) {
        setPoints((prev) => prev + 1);
        await playFile(`${audioFolder}/correct_${languageCode}.mp3`);
      } else {
        await playFile(`${audioFolder}/error_${languageCode}.mp3`);
      }
      if (explainAudio) {
        await playAudio(explainAudio);
      }
      if (currentQuestion === questions.length - 1) {
        finishQuizz();
        return;
      }
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  useEffect(() => {
    if (!questions || userResponse === "") {
      return;
    }

    if (currentQuestion > questions?.length) {
      finishQuizz();
      return;
    }

    checkAnswer();
  }, [userResponse]);

  useEffect(() => {
    if (questions) {
      if (currentQuestion > questions?.length - 1) {
        finishQuizz();
      } else if (currentQuestion > -1) {
        getNextQuestion();
      }
    }
  }, [currentQuestion]);

  useEffect(() => {
    setQuestions(undefined);
    setPoints(0);
    const user = usePlayerDataStore.getState();
    if (user.name === "") {
      setCurrentStep("selectLanguage");
    } else {
      setCurrentStep("selectTopic");
    }
    if (voiceId === "") {
      getPresenterVoice();
    }
  }, []);

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
          {currentStep !== "finish" && (
            <img
              onClick={() => repeatAudio()}
              className={styles.container_presenter__image}
              src="/assets/cabraTrivial.png"
              alt=""
            />
          )}
          {error ? (
            <>
              <p>There was an error with our services</p>
              <TextButton
                text="Reintentar"
                action={() => {
                  setError(null);
                  setCurrentStep("selectTopic");
                }}
              />
            </>
          ) : (
            <>
              <AnimatePresence mode="wait">
                {currentStep === "selectLanguage" && (
                  <motion.div
                    className={styles.container_presenter_inputs}
                    initial={{ x: "-100vw", opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{
                      x: "-100vw",
                      opacity: 0,
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
                      opacity: 0,
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
                      opacity: 0,
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
                          {questions[currentQuestion].options.map(
                            (option, i) => (
                              <TextButton
                                key={i}
                                text={option}
                                disabled={isSpeaking}
                                action={() => setUserResponse(option)}
                              />
                            )
                          )}
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <AnimatePresence mode="wait">
                {currentStep === "finish" && (
                  <motion.div
                    className={styles.container_presenter_quizz}
                    initial={{ x: "100vw", opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{
                      x: "100vw",
                      opacity: 0,
                    }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    <img
                      className={styles.container_presenter__image}
                      src="/assets/trofeo.png"
                      alt=""
                    />
                    <p>
                      Has obtenido {points}/{questions?.length}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </section>
    </>
  );
};

export default Home;
