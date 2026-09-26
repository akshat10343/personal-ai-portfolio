export type Theme = "dark" | "light";

/** The theme currently on <html>, which index.html sets before first paint. */
export function getTheme(): Theme {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

export function setTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "light" ? "#f5f5f7" : "#000000");
  try {
    localStorage.setItem("theme", theme);
  } catch {
    // Storage can be blocked (private mode); the switch still works for this visit.
  }
}
