import "./globals.css";

export const metadata = {
  title: "GamePriceTracker | Steam Price Monitor",
  description: "Monitore preços de jogos da Steam",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="pt-BR"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
