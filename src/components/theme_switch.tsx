import { useEffect, useState } from "react";
import { applyTheme, storedTheme, Theme, THEME_LABELS, THEMES } from "../theme";
import "./theme_switch.css";

// a three position slider running from the light theme, through the low contrast dark
// one, to the high contrast dark one. The names under it can be clicked as well
export function ThemeSwitch(): JSX.Element {
  const [theme, setTheme] = useState<Theme>(storedTheme);

  useEffect(() => applyTheme(theme), [theme]);

  return (
    <div className="themeSwitch">
      <label htmlFor="themeSlider">Theme</label>
      <div className="themeSlider">
        <input
          id="themeSlider"
          type="range"
          min={0}
          max={THEMES.length - 1}
          step={1}
          value={THEMES.indexOf(theme)}
          aria-valuetext={THEME_LABELS[theme]}
          onChange={e => setTheme(THEMES[Number(e.target.value)])}
        />
        <div className="themeNames" aria-hidden="true">
          {THEMES.map(t =>
            <span
              key={t}
              className={t === theme ? "selected" : undefined}
              onClick={() => setTheme(t)}
            >
              {THEME_LABELS[t]}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
