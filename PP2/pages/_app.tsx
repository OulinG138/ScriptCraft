import "@/styles/globals.css";
import * as React from "react";
import type { AppProps } from "next/app";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/context/AuthProvider";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./Theme";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Toaster position="top-center" />
        <Component {...pageProps} />
      </AuthProvider>
    </ThemeProvider>
  );
}
