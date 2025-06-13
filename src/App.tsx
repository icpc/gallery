import { JSX } from "react";

import { Grid } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { SnackbarProvider } from "notistack";

import { useAppContext } from "./components/AppContext";
import Body from "./components/Body/Body";
import Header from "./components/Header/Header";
import { DesktopLogo } from "./components/Logo";
import Sidebar from "./components/Sidebar";
import { description, title } from "./consts";
import theme from "./theme";
import { useHead } from "./utils/useHead";

import "./styles/App.css";

function App(): JSX.Element {
  const { desktop } = useAppContext();

  useHead({ title, description });

  return (
    <ThemeProvider theme={theme}>
      <SnackbarProvider />
      <CssBaseline />
      <Grid container columns={10} height="100vh" p={2} pb={0} spacing={1}>
        {desktop && (
          <Grid
            container
            size={2}
            direction="column"
            justifyContent="space-between"
          >
            <DesktopLogo />
            <Sidebar />
          </Grid>
        )}
        <Grid
          size="grow"
          display="flex"
          flexDirection="column"
          justifyContent="space-between"
        >
          <Header />
          <Body />
        </Grid>
      </Grid>
    </ThemeProvider>
  );
}

export default App;
