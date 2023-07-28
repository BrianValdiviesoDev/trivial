import styles from "./TextButton.module.scss";
import { Trans } from "@lingui/react";

const TextButton: React.FC<{
  text: string;
  action: () => void;
  disabled?: boolean;
}> = ({ text, action, disabled }) => {
  return (
    <button
      onClick={action}
      className={`${styles.button} ${disabled ? styles.disabled : ""}`}
    >
      <Trans id={text} />
    </button>
  );
};

export default TextButton;
