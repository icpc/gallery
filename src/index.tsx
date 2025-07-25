import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { UnheadProvider, createHead } from "@unhead/react/client";

import App from "./App";
import { AppContextProvider } from "./components/AppContext";
import { PhotoInfoProvider } from "./components/Body/PhotoInfo/PhotoInfoContext";
import { UNIQUE_CONTEST_KEY } from "./consts";

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
  key: `icpc-gallery-query+${UNIQUE_CONTEST_KEY}`,
});

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);

const head = createHead();

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <UnheadProvider head={head}>
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
      </UnheadProvider>
    </BrowserRouter>
  </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
