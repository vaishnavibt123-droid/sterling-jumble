import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BagProvider } from "./context/BagContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BagProvider>
      <App />
    </BagProvider>
  </StrictMode>
);
