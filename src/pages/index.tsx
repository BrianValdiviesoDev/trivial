import Head from "next/head";
import styles from "@/styles/pages/Home.module.scss";

import { LANGUAGES } from "../utils/constans";
import { usePlayerDataStore } from "../store/playerDataStore";
import { useGameDataStore } from "../store/gameDataStore";
import TextButton from "../components/UI/TextButton";
import { use, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChatMessage,
  Question,
  chatRequest,
  getModels,
  getPrompt,
  replaceNumbers
} from "@/services/openai.service";
import { Trans } from "@lingui/react";
import { useAppStatusStore } from "../store/appStatusStore";
import { getVoices, tts } from "@/services/elevenLabs.service";
import LanguageNameStep from "../components/steps/LanguageNameStep";
import TopicStep from "../components/steps/TopicStep";
import QuizzStep from "../components/steps/QuizzStep";
import FinishStep from "../components/steps/FinishStep";
interface QuestionAudios {
  question: AudioBuffer;
  answers: AudioBuffer;
  explain: AudioBuffer;
}
const Home = () => {
  // Store
  const {
    name,
    language,
    currentTopic,
    currentScore,
    setCurrentScore,
    history,
    setHistory
  } = usePlayerDataStore();
  const { setIsAppLoading, setIsAppPersonalized } = useAppStatusStore();
  const { currentStep, setCurrentStep } = useGameDataStore();

  // Component states
  const [questions, setQuestions] = useState<Question[]>();
  const [currentQuestion, setCurrentQuestion] = useState<number>(-1);
  const [audios, setAudios] = useState<QuestionAudios[]>();
  const [userResponse, setUserResponse] = useState<number>();
  const [voiceId, setVoiceId] = useState<string>("");
  const [error, setError] = useState<string | null>();
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [conversation, setConversation] = useState<ChatMessage[]>([]);
  const audioFolder = "assets";
  const numberOfQuestions = 5;
  const addToConversation = (msg: ChatMessage) => {
    const newConversations = [...conversation, msg];
    setConversation(newConversations);
  };

  const fixNumbers = async (q: Question): Promise<Question> => {
    const questionHasNumbers = replaceNumbers(q.question);
    if (questionHasNumbers) {
      const questionWithoutNumbers = await chatRequest(questionHasNumbers);
      const myRequest: ChatMessage = {
        role: "system",
        content: questionHasNumbers
      };
      const iaResponse: ChatMessage = {
        role: "assistant",
        content: questionWithoutNumbers
      };
      addToConversation(myRequest);
      addToConversation(iaResponse);

      q.question = questionWithoutNumbers;
    }

    const explainHasNumbers = replaceNumbers(q.explain);
    if (explainHasNumbers) {
      const explainWithoutNumbers = await chatRequest(explainHasNumbers);
      const myRequest: ChatMessage = {
        role: "system",
        content: explainHasNumbers
      };
      const iaResponse: ChatMessage = {
        role: "assistant",
        content: explainWithoutNumbers
      };
      addToConversation(myRequest);
      addToConversation(iaResponse);

      q.explain = explainWithoutNumbers;
    }

    q.options.forEach(async (o, i) => {
      const hasNumbers = replaceNumbers(o);
      if (hasNumbers) {
        const withoutNumbers = await chatRequest(hasNumbers);
        const myRequest: ChatMessage = {
          role: "system",
          content: hasNumbers
        };
        const iaResponse: ChatMessage = {
          role: "assistant",
          content: withoutNumbers
        };
        addToConversation(myRequest);
        addToConversation(iaResponse);

        q.options[i] = withoutNumbers;
      }
    });

    return q;
  };

  const prepareQuizz = async () => {
    setIsAppLoading(true);
    try {
      const questions = Array(numberOfQuestions).fill(undefined);
      const audios = Array(numberOfQuestions).fill(undefined);
      for (let i = 0; i < numberOfQuestions; i++) {
        const prompt = getPrompt(currentTopic, language, 1);
        const myRequest: ChatMessage = {
          role: "system",
          content: prompt
        };
        const response = await chatRequest(prompt, conversation);
        const iaResponse: ChatMessage = {
          role: "assistant",
          content: response
        };
        addToConversation(myRequest);
        addToConversation(iaResponse);

        const data = JSON.parse(response)[0];
        const answerIndex = data.options.findIndex(
          (o: string) => o === data.answer
        );
        const newQuestion: Question = {
          question: data.question,
          options: data.options,
          answer: answerIndex,
          explain: data.explain
        };
        questions[i] = newQuestion;
        setQuestions(questions);
        const ttsQuestion = await fixNumbers(newQuestion);

        const newAudio = await generateQuestionAudios(ttsQuestion);
        audios[i] = newAudio;
        setAudios(audios);
        if (i === 0) {
          setCurrentQuestion(0);
          setCurrentStep("quizz");
        }
      }
    } catch (e) {
      setError("OpenAI error");
      setIsAppLoading(false);
    }
  };

  const generateQuestionAudios = async (
    question: Question
  ): Promise<QuestionAudios> => {
    const questionAudio = await tts(question.question, language, voiceId);
    const responsesAudio = await generateResponsesAudios(
      question.options,
      language
    );
    const explainAudio = await tts(question.explain, language, voiceId);
    const response = {
      question: questionAudio,
      answers: responsesAudio,
      explain: explainAudio
    };
    return response;
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
    const newResponses = responses.map((r, i) => {
      return `${preAnswers?.indexes[i]}.
        ${r}
        .
        .`;
    });
    const audio = await tts(newResponses.join("."), language, voiceId);
    return audio;
  };
  const getNextQuestion = async () => {
    setUserResponse(undefined);

    if (audios && voiceId) {
      if (audios[currentQuestion]) {
        await playAudio(audios[currentQuestion].question);
        await playAudio(audios[currentQuestion].answers);
      }
    } else {
      setCurrentStep("selectTopic");
    }
  };
  const repeatAudio = async () => {
    if (audios) {
      await playAudio(audios[currentQuestion].question);
      await playAudio(audios[currentQuestion].answers);
    }
  };
  const playAudio = async (audio: AudioBuffer) => {
    try {
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
    } catch (e) {
      console.error("Error playing audio");
    }
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
    setCurrentStep("finish");
  };
  const getPresenterVoice = async () => {
    try {
      const voices = await getVoices();
      const goatVoice = voices.find((v: any) => v.name === "CABRA");
      const presenterVoice = goatVoice
        ? goatVoice.voice_id
        : voices[0].voice_id;
      setVoiceId(presenterVoice);
    } catch (e) {
      console.error("Error searching presenter voice");
    }
  };
  const checkAnswer = async () => {
    if (questions && userResponse !== undefined) {
      // const folderUrl = `${audioFolder}/audios_${language}`;
      // const files = await getAudioFiles(folderUrl);
      if (userResponse === questions[currentQuestion].answer) {
        setCurrentScore(currentScore + 1);
        // const rightFiles = files.filter((f) => f.includes("right"));
        const randomIndex = Math.floor(Math.random() * 7);
        // await playFile(`./${folderUrl}/${rightFiles[randomIndex]}`);;
        await playFile(
          `/assets/audios_${language}/right_${randomIndex}_${language.toUpperCase()}.mp3`
        );
      } else {
        // const wrongFiles = files.filter((f) => f.includes("wrong"));
        const randomIndex = Math.floor(Math.random() * 7);
        await playFile(
          `/assets/audios_${language}/wrong_${randomIndex}_${language.toUpperCase()}.mp3`
        );
      }
      if (audios) {
        await playAudio(audios[currentQuestion]?.explain);
      }
      if (currentQuestion === questions.length - 1) {
        finishQuizz();
        return;
      }
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  //Go next question or finish when user response
  useEffect(() => {
    if (!questions || userResponse === undefined) {
      return;
    }
    checkAnswer();
  }, [userResponse]);

  //Watcher for next question if user pass last one and next question is still loading
  useEffect(() => {
    if (questions) {
      if (questions?.length > 0 && questions[currentQuestion] !== undefined) {
        setIsAppLoading(false);
        getNextQuestion();
      }
    }
  }, [audios, currentQuestion]);

  //Manage screens
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
    if (name !== "" && language !== "") {
      localStorage.setItem("user", JSON.stringify({ name, language }));
      setIsAppPersonalized(true);
    }
  }, [name, language]);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const { name, language } = JSON.parse(user);
      usePlayerDataStore.setState({ name, language });
      setIsAppPersonalized(true);
    }

    name && language && setCurrentStep("selectTopic");
  }, []);

  const testRandom = async () => {
    const folderUrl = `${audioFolder}/audios_${language}`;
    const files = await getAudioFiles(folderUrl);
    const rightFiles = files.filter((f) => f.includes("right"));
    const randomIndex = Math.floor(Math.random() * rightFiles.length);
    await playFile(`.${folderUrl}/${rightFiles[randomIndex]}`);
  };

  const getAudioFiles = async (folderUrl: string): Promise<string[]> => {
    const publicPath = `${folderUrl}`;
    const response = await fetch(
      `/api/listFiles?directoryPath=${encodeURIComponent(publicPath)}`
    );
    const data = await response.json();
    return data.fileList;
  };

  //Init setup
  useEffect(() => {
    setQuestions(undefined);
    setCurrentScore(0);
    setIsAppLoading(false);
    setAudios(undefined);
    const history = localStorage.getItem("history");
    if (history) {
      setHistory(JSON.parse(history));
    }

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
                <LanguageNameStep key="selectLanguage" />
              )}

              {currentStep === "selectTopic" && (
                <TopicStep prepareQuizz={prepareQuizz} key="selectTopic" />
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
