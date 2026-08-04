import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import HexiumApp from "./app/App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HexiumApp />
  </StrictMode>,
);
