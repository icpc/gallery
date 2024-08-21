import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import { AppContextProvider } from "./components/AppContext";
import { PhotoInfoProvider } from "./components/Body/PhotoInfo/PhotoInfoContext";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));

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
