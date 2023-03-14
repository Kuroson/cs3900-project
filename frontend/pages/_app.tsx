import "styles/globals.scss";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import type { AppProps } from "next/app";
import { StyledEngineProvider, ThemeProvider, createTheme } from "@mui/material/styles";
import { Layout } from "components";
import initAuth from "util/firebase";

const theme = createTheme({
  palette: {
    primary: {
      main: "#26a69a",
    },
    error: {
      main: "#e57373",
    },
  },
});

export default function App({ Component, pageProps }: AppProps): JSX.Element {
  initAuth();
  return (
    <>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </ThemeProvider>
      </StyledEngineProvider>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        limit={3}
      />
    </>
  );
}
