
import "@/styles/globals.css";
import { ToastContainer } from "react-toastify";
import { ReduxProvider } from "@/store/provider";
import { SessionProvider } from "@/components/providers/SessionProvider";
import "react-toastify/dist/ReactToastify.css";

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
    <html lang="uz">
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
