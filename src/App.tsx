import { JSX } from "react";

import { Box, CssBaseline, ThemeProvider } from "@mui/material";
import { useSeoMeta } from "@unhead/react";
import { SnackbarProvider } from "notistack";

import { useAppContext } from "./components/AppContext";
import Body from "./components/Body/Body";
import Header from "./components/Header/Header";
import { DesktopLogo } from "./components/Logo";
import Sidebar from "./components/Sidebar";
import { description, title } from "./consts";
import theme from "./theme";

import "./styles/App.css";

function App(): JSX.Element {
  const { desktop } = useAppContext();

  useSeoMeta({
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    twitterTitle: title,
    twitterDescription: description,
  });

  return (
    <ThemeProvider theme={theme}>
      <SnackbarProvider />
      <CssBaseline />

      <Box
        display="grid"
        height="100vh"
        p={2}
        pb={0}
        gap={1}
        gridTemplateColumns={desktop ? "2fr 8fr" : "1fr"}
        gridTemplateRows={desktop ? "minmax(130px, auto) 1fr" : "auto 1fr"}
        gridTemplateAreas={
          desktop ? `"logo header"\n"sidebar body"` : `"header"\n"body"`
        }
      >
        {desktop && (
          <>
            <Box
              gridArea="logo"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <DesktopLogo />
            </Box>

            <Box gridArea="sidebar" minHeight={0}>
              <Sidebar />
            </Box>
          </>
        )}

        <Box
          gridArea="header"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Header />
        </Box>

        <Box gridArea="body" minHeight={0}>
          <Body />
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
