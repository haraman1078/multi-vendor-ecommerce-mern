import { useEffect, useState } from "react";

/*
  WHY a custom hook for dark mode?
  Three things need to happen together:
  1. Read saved preference from localStorage on first load
  2. Add/remove "dark" class on <html> element
  3. Save preference to localStorage when user toggles

  A custom hook keeps this logic in one place.
  Any component can call useDarkMode() to get the toggle function.
*/

const useDarkMode = () => {
  const [isDark, setIsDark] = useState(() => {
    // On first render, check localStorage
    // If nothing saved, check OS preference as default
    const saved = localStorage.getItem("theme");
    if (saved) return saved === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    const root = document.documentElement; // <html> element
    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  const toggle = () => setIsDark((prev) => !prev);

  return { isDark, toggle };
};

export default useDarkMode;