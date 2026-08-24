import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

function loadOptionalAnalytics() {
  const endpoint = import.meta.env.VITE_ANALYTICS_ENDPOINT;
  const websiteId = import.meta.env.VITE_ANALYTICS_WEBSITE_ID;
  if (!endpoint || !websiteId) return;

  const script = document.createElement("script");
  script.defer = true;
  script.src = `${endpoint.replace(/\/$/, "")}/umami`;
  script.dataset.websiteId = websiteId;
  document.head.appendChild(script);
}

createRoot(document.getElementById("root")!).render(<App />);

const scheduleAnalytics = () => {
  const idleWindow = window as Window & {
    requestIdleCallback?: (
      callback: () => void,
      options?: { timeout?: number }
    ) => number;
  };
  if (idleWindow.requestIdleCallback) {
    idleWindow.requestIdleCallback(loadOptionalAnalytics, { timeout: 2000 });
  } else {
    globalThis.setTimeout(loadOptionalAnalytics, 1500);
  }
};

if (document.readyState === "complete") {
  scheduleAnalytics();
} else {
  window.addEventListener("load", scheduleAnalytics, { once: true });
}
