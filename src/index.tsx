import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import "./styles.css";
import { storedTheme } from "./theme";

import App from "./App";

// set before the first render so a dark theme doesn't flash up light first
document.documentElement.dataset.theme = storedTheme();

const root = createRoot(document.getElementById("root") as HTMLElement);
root.render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>
);
