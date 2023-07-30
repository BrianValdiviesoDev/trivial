import { useAppStatusStore } from "../../../store/appStatusStore";
import styles from "./Footer.module.scss";
import { BiReset } from "@react-icons/all-files/bi/BiReset";
import { Trans } from "@lingui/react";
import { useGameDataStore } from "../../../store/gameDataStore";
import { usePlayerDataStore } from "../../../store/playerDataStore";
import { AnimatePresence, motion } from "framer-motion";

const Footer = () => {
  // Store
  const { isAppPersonalized } = useAppStatusStore();
  const { currentStep, setCurrentStep } = useGameDataStore();
  const { setName, setLanguage, setHistory, setCurrentScore, setCurrentTopic } =
    usePlayerDataStore();

  //   Methods
  const onHandleGameReset = () => {
    setCurrentStep("selectLanguage");
    setName("");
    setLanguage("en");
    setHistory([]);
    setCurrentScore(0);
    setCurrentTopic("");
    localStorage.removeItem("user");
    localStorage.removeItem("history");
  };

  return (
    <footer className={styles.footer}>
      <AnimatePresence mode="wait">
        {isAppPersonalized && currentStep === "finish" && (
          <motion.div
            className={styles.footer_container}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Trans
              id="Game reset"
              render={({ translation }) => (
                <BiReset
                  className={styles.footer_container__reset}
                  title={translation as string}
                  size="1.5rem"
                  color="#fff"
                  onClick={onHandleGameReset}
                />
              )}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </footer>
  );
};

export default Footer;
