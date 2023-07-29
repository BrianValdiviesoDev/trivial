import Head from "next/head";
import styles from "@/styles/pages/Home.module.scss";

import { LANGUAGES } from "../utils/constans";
import { usePlayerDataStore } from "../store/playerDataStore";
import { useGameDataStore } from "../store/gameDataStore";
import TextButton from "../components/UI/TextButton";
import { use, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Question, getModels, getQuestions } from "@/services/openai.service";
import { Trans } from "@lingui/react";
import { useAppStatusStore } from "../store/appStatusStore";
import { getVoices, tts } from "@/services/elevenLabs.service";
import LanguageNameStep from "../components/steps/LanguageNameStep";
import TopicStep from "../components/steps/TopicStep";
import QuizzStep from "../components/steps/QuizzStep";
import FinishStep from "../components/steps/FinishStep";

const Home = () => {
  // Store
  const {
    language,
    currentTopic,
    currentScore,
    setCurrentScore,
    history,
    setHistory
  } = usePlayerDataStore();
  const { setIsAppLoading } = useAppStatusStore();
  const { currentStep, setCurrentStep } = useGameDataStore();

  // Component states
  const [questions, setQuestions] = useState<Question[]>();
  const [currentQuestion, setCurrentQuestion] = useState<number>(-1);
  const [questionAudio, setQuestionAudio] = useState<AudioBuffer>();
  const [answersAudio, setAnswersAudio] = useState<AudioBuffer>();
  const [explainAudio, setExplainAudio] = useState<AudioBuffer>();
  const [userResponse, setUserResponse] = useState<string>();
  const [voiceId, setVoiceId] = useState<string>("");
  const [error, setError] = useState<string | null>();
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
          "Respuesta g"
        ]
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
          "Answer g"
        ]
      }
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
    const presenterVoice = voices.find((v: any) => v.name === "CABRA").voice_id;
    setVoiceId(presenterVoice);
  };
  const checkAnswer = async () => {
    if (questions && userResponse !== "") {
      const languageCode =
        LANGUAGES.find((l) => l.code === language)?.code || "en";
      if (userResponse === questions[currentQuestion].answer) {
        setCurrentScore(currentScore + 1);
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
    setCurrentScore(0);
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

  useEffect(() => {
    if (currentStep !== "finish") return;
    setHistory([
      ...history,
      {
        topic: currentTopic,
        score: currentScore
      }
    ]);
    localStorage.setItem(
      "history",
      JSON.stringify([
        ...history,
        {
          topic: currentTopic,
          score: currentScore
        }
      ])
    );
  }, [currentStep]);

  useEffect(() => {
    const history = localStorage.getItem("history");
    if (history) {
      setHistory(JSON.parse(history));
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
          {error ? (
            <>
              <p>
                <Trans id="There was an error with our services" />
              </p>
              <TextButton
                action={() => {
                  setError(null);
                  setCurrentStep("selectTopic");
                }}
              >
                <Trans id="Try again" />
              </TextButton>
            </>
          ) : (
            <AnimatePresence mode="wait">
              {currentStep === "selectLanguage" && (
                <LanguageNameStep
                  key="selectLanguage"
                  repeatAudio={repeatAudio}
                />
              )}

              {currentStep === "selectTopic" && (
                <TopicStep
                  prepareQuizz={prepareQuizz}
                  key="selectTopic"
                  repeatAudio={repeatAudio}
                />
              )}
              {currentStep === "quizz" && (
                <QuizzStep
                  key="quizz"
                  setUserResponse={setUserResponse}
                  questions={questions}
                  currentQuestion={currentQuestion}
                  isSpeaking={isSpeaking}
                  repeatAudio={repeatAudio}
                />
              )}
              {currentStep === "finish" && (
                <FinishStep questions={questions} key="finish" />
              )}
            </AnimatePresence>
          )}
        </div>
      </section>
    </>
  );
};

export default Home;
