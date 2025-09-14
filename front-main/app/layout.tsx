import "@/styles/globals.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import { ReduxProvider } from "../store/provider";
import { ApolloProvider } from "@apollo/client";
import { client } from "@/apolloClient";
import { useState } from "react";
import GoogleAnalytics from "@/components/common/GoogleAnalytics";
import PerformanceMonitor from "@/components/common/PerformanceMonitor";
import SEOMonitor from "@/components/common/SEOMonitor";
import { SessionProvider } from "@/components/providers/SessionProvider";

export const metadata = {
  title: "Inbola - O'yinchiqlar va Bolalar Mahsulotlari",
  description: "Bolalar uchun xavfsiz va sifatli o'yinchiqlar, kiyimlar va boshqa mahsulotlar",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <ReduxProvider>
            <div id="root">{children}</div>
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
        </SessionProvider>
      </body>
    </html>
  );
}
