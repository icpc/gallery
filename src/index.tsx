import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  },
});

const persister = createSyncStoragePersister({
  storage: window.localStorage,
  key: "icpc-gallery-query",
});

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ persister }}
      >
        <AppContextProvider>
          <PhotoInfoProvider>
            <App />
          </PhotoInfoProvider>
        </AppContextProvider>
      </PersistQueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
