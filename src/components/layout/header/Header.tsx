import { useTheme } from "next-themes";
import styles from "./Header.module.scss";

function Header() {
  const { theme, setTheme } = useTheme();
  return (
    <header className={styles.header}>
      <button
        onClick={() => {
          theme === "light" ? setTheme("dark") : setTheme("light");
        }}
      >
        {theme === "light" ? "Dark" : "Light"}
      </button>
    </header>
  );
}

export default Header;
