import "@/styles/globals.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { ToastContainer } from "react-toastify";
import MainLayout from "../layout";
import { ReduxProvider } from "../store/provider";
import { ApolloProvider } from "@apollo/client";
import { client } from "@/apolloClient";
import { useEffect, useState } from "react";
import GoogleAnalytics from "@/components/common/GoogleAnalytics";
import PerformanceMonitor from "@/components/common/PerformanceMonitor";
import SEOMonitor from "@/components/common/SEOMonitor";

export default function App({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  }));
  
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Google Analytics page tracking
  useEffect(() => {
    const handleRouteChange = (url: string) => {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('config', process.env.NEXT_PUBLIC_GA_ID || 'G-XXXXXXXXXX', {
          page_path: url,
        });
      }
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  const noLayoutPages = ["/sign-up", "/login", "/forgot-password", "/admin"];
  const shouldShowLayout = !noLayoutPages.includes(router.pathname);

  // Prevent hydration issues
  if (!mounted) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ApolloProvider client={client}>
        <ReduxProvider>
          <GoogleAnalytics />
          <PerformanceMonitor />
          <SEOMonitor />
          {shouldShowLayout ? (
            <MainLayout>
              <Component {...pageProps} />
            </MainLayout>
          ) : (
            <Component {...pageProps} />
          )}
          <ToastContainer 
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </ReduxProvider>
      </ApolloProvider>
    </QueryClientProvider>
  );
}
