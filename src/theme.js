import { createTheme } from "@mui/material/styles";

const theme = createTheme({
    palette: {
        mode: "dark",
        background: {
            default: "#1A1A1A",
            paper: "#2E2E2E",
            transparent: "rgb(27, 27, 27)",
        },
        text: {
            secondary: "#8A8A8A",
        }
    },
    components: {
        MuiTypography: {
            styleOverrides: {
                h1: {
                    fontSize: "2rem",
                    fontWeight: "bold",
                    marginTop: "0.83rem",
                    marginBottom: "0.83rem",
                },
                h5: {
                    color: "#8A8A8A",
                },
            },
        },
        MuiPaper: {
            defaultProps: {
                elevation: 0,
            },
            styleOverrides: {
                root: {
                    width: "100%",
                    borderRadius: "8px",
                },
            },
        },
        MuiAutocomplete: {
            styleOverrides: {
                root: {
                    margin: 0,
                    padding: 0,
                },
                paper: {
                    backgroundColor: "#2E2E2E",
                    color: "#8A8A8A",
                },
                option: {
                    paddingTop: 4,
                    paddingBottom: 4,
                }
            },
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    paddingLeft: "10px",
                    paddingRight: 0,
                },
                notchedOutline: {
                    display: "none",
                },
                input: {
                    paddingLeft: "0px",
                },
            },
        },
    },
});

export default theme;
