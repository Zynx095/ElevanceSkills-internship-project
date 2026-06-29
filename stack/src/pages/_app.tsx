import type { AppProps } from "next/app";
import { ToastContainer } from "react-toastify";
import { AuthProvider } from "@/lib/AuthContext";
import Head from "next/head";
import {
  LanguageProvider
} from "@/lib/LanguageContext";
export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Code-Quest</title>
        <script
          src="https://checkout.razorpay.com/v1/checkout.js"
        />
      </Head>
      <AuthProvider>

        <LanguageProvider>

          <ToastContainer />

          <Component
            {...pageProps}
          />

        </LanguageProvider>

      </AuthProvider>
    </>
  );
}
