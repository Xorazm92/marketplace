import "@/styles/globals.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { ToastContainer } from "react-toastify";
import MainLayout from "../layout";
import { ReduxProvider } from "../store/provider";
import { ApolloProvider } from "@apollo/client";
import { client } from "@/apolloClient";

export default function App({ Component, pageProps }: AppProps) {
  const queryClient = new QueryClient();
  const router = useRouter();

  const noLayoutPages = ["/sign-up", "/login", "/forgot-password", "/admin"];
  const shouldShowLayout = !noLayoutPages.includes(router.pathname);

  return (
    <QueryClientProvider client={queryClient}>
      <ApolloProvider client={client}>
        <ReduxProvider>
            {shouldShowLayout ? (
              <MainLayout>
                <Component {...pageProps} />
              </MainLayout>
            ) : (
              <Component {...pageProps} />
            )}
            <ToastContainer />
        </ReduxProvider>
      </ApolloProvider>
    </QueryClientProvider>
  );
}
