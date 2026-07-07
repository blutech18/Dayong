// Simple dark-default theme controller with localStorage persistence.
// Applies `.dark` on <html>. Safe to call in SSR (guards window).

const STORAGE_KEY = "dayong-theme";
export type Theme = "light" | "dark";

export function getTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return "dark";
}

export function setTheme(theme: Theme) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, theme);
  const root = window.document.documentElement;
  if (theme === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
}

export function toggleTheme() {
  setTheme(getTheme() === "dark" ? "light" : "dark");
}

// Inline script for SSR to prevent flash of unstyled theme.
export const themeInitScript = `
(function(){try{var k='${STORAGE_KEY}';var t=localStorage.getItem(k);if(t!=='light'&&t!=='dark')t='dark';if(t==='dark')document.documentElement.classList.add('dark');}catch(e){document.documentElement.classList.add('dark');}})();
`;
