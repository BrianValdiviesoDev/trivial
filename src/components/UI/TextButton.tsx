import styles from "./TextButton.module.scss";

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
      {text}
    </button>
  );
};

export default TextButton;
