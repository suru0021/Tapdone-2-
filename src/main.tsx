import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

// Instant dark background — no white flash
document.documentElement.style.backgroundColor = "#0a0a0a";
document.body.style.backgroundColor = "#0a0a0a";
document.body.style.margin = "0";
document.body.style.padding = "0";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
