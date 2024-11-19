import { createTheme } from "@mui/material/styles";
// import "@mui/material/styles/createPalette"
declare module "@mui/material/styles/createPalette" {
  interface Palette {
    greyBackground?: Palette["primary"];
    blueBackground?: Palette["primary"];
  }
  interface PaletteOptions {
    greyBackground?: PaletteOptions["primary"];
    blueBackground?: PaletteOptions["primary"];
  }
}

const theme = createTheme({
  typography: {
    fontFamily: [
      "Noto Sans JP",
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(","),
  },
  palette: {
    primary: {
      // light: will be calculated from palette.primary.main,
      main: "#2C7EF4",
      // dark: will be calculated from palette.primary.main,
      // contrastText: will be calculated to contrast with palette.primary.main
    },
    secondary: {
      main: "#FFCB73",
    },
    greyBackground: {
      main: "#f5f5f5",
    },
    blueBackground: {
      main: "rgba(44, 126, 244, 0.05)",
    },
    // Used by `getContrastText()` to maximize the contrast between
    // the background and the text.
    contrastThreshold: 3,
    // Used by the functions below to shift a color's luminance by approximately
    // two indexes within its tonal palette.
    // E.g., shift from Red 500 to Red 300 or Red 700.
    tonalOffset: 0.2,
  },
});

export default theme;
