import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

// White blink fix — body ला dark background लगेच द्या
document.body.style.backgroundColor = "#0a0a0a";
document.body.style.margin = "0";
document.body.style.padding = "0";
document.body.style.overflow = "hidden";

const root = document.getElementById("root")!;
root.style.backgroundColor = "#0a0a0a";
root.style.minHeight = "100vh";

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
);
