import './globals.css';

// Export metadata directly
const metadata = {
  title: 'INBOLA Marketplace',
  description: 'Bolalar uchun xavfsiz va sifatli mahsulotlar',
};

export { metadata };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="app">
        <div className="container">
          {children}
        </div>
      </body>
    </html>
  );
}
