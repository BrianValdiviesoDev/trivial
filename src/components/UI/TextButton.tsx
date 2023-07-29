import styles from "./TextButton.module.scss";

type TextButtonProps = {
  action: () => void;
  disabled?: boolean;
  children: React.ReactNode;
};
const TextButton = ({ action, disabled, children }: TextButtonProps) => {
  return (
    <button
      onClick={action}
      className={`${styles.button} ${disabled ? styles.disabled : ""}`}
    >
      {children}
    </button>
  );
};

export default TextButton;
