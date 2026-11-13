// the colour themes the site can be shown in, in the order the theme switch runs through
// them: light, then a low contrast dark, then a high contrast dark
export const THEMES = ["light", "dim", "dark"] as const;
export type Theme = typeof THEMES[number];

export const THEME_LABELS: Record<Theme, string> = {
  light: "Light",
  dim: "Dim",
  dark: "Dark",
};

const STORAGE_KEY = "chordAlmanac.theme";

// the theme chosen on an earlier visit, or light if there was none. Storage can be
// missing or blocked, in which case every visit starts light
export function storedTheme(): Theme {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if ((THEMES as readonly string[]).includes(stored ?? "")) {
      return stored as Theme;
    }
  } catch {
    // fall through to the default
  }
  return "light";
}

// shows the site in `theme`, and remembers it for the next visit
export function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // the theme just won't be remembered
  }
}
