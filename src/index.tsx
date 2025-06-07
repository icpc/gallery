import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import LogRocket from "logrocket";
import setupLogRocketReact from "logrocket-react";

import App from "./App";
import { AppContextProvider } from "./components/AppContext";
import { PhotoInfoProvider } from "./components/Body/PhotoInfo/PhotoInfoContext";

function logRocketId() {
  const env = import.meta.env.MODE || "development";
  if (env === "production") {
    return "0y4ijo/icpc-gallery-prod";
  } else if (env === "staging") {
    return "0y4ijo/icpc-gallery-staging";
  } else {
    return "0y4ijo/icpc-gallery-dev";
  }
}

LogRocket.init(logRocketId());
setupLogRocketReact(LogRocket);

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AppContextProvider>
        <PhotoInfoProvider>
          <App />
        </PhotoInfoProvider>
      </AppContextProvider>
    </BrowserRouter>
  </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
